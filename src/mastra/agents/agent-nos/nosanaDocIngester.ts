import { MDocument } from "@mastra/rag";
import * as path from "path";
import { embedMany } from "ai";
import { embedModel, vectorStore } from "@/config";
import fs from "fs";

type NosanaDocUrl = `https://docs.nosana.io/${string}`;

export function findSourcePath(filesource: string): NosanaDocUrl {
  const pathParts = filesource.split("/");
  const fileName = pathParts.pop() as string;
  if (fileName === "index.md") {
    return `https://docs.nosana.io/${pathParts.join("/")}` as NosanaDocUrl;
  }
  return `https://docs.nosana.io/${pathParts.join("/")}/${fileName.replace(
    ".md",
    ".html"
  )}` as NosanaDocUrl;
}

async function processAllDocs() {
  const docsDir = path.join(__dirname, "nosana_docs");

  async function processDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await processDir(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.endsWith(".md") &&
        entry.name.toLowerCase() !== "readme.md"
      ) {
        let relativePath = path.relative(
          path.join(__dirname, "nosana_docs"),
          fullPath
        );
        const markdownText = fs.readFileSync(fullPath, "utf-8");
        const doc = MDocument.fromMarkdown(markdownText);
        console.log(relativePath);
        await chunkEmbedAndUpsert(doc, relativePath);
        console.log(relativePath, "done");
      }
    }
  }

  await processDir(docsDir);
}

async function chunkEmbedAndUpsert(doc: MDocument, docpath: string) {
  // Split the document into chunks
  const chunks = await doc.chunk({
    strategy: "markdown",
    size: 768,
    overlap: 100,
  });

  // gemini can handle only 100 at a time
  const batchSize = 100;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const chunkBatch = chunks.slice(i, i + batchSize);

    const { embeddings } = await embedMany({
      values: chunkBatch.map((chunk) => chunk.text),
      model: embedModel,
    });

    await vectorStore.upsert({
      documents: chunkBatch.map((chunk) => chunk.text),
      indexName: "docs",
      vectors: embeddings,
      metadata: chunkBatch.map(() => ({
        source: findSourcePath(docpath),
      })),
    });
  }
}

// Call the function
processAllDocs()
  .then(() => console.log("All documents processed!"))
  .catch(console.error);
