import * as fs from "node:fs/promises";
import * as pacote from "pacote";
import * as prettier from "prettier";

// Check the types against some actual examples from the npm registry.
// Call pacote.manifest() and pacote.packument() with and without the fullMetadata option.
// Embed the JSON results in TypeScript source files, then use the TypeScript compiler to confirm the corresponding types are compatible.
writeManifestFixtures("tiny-tarball@1.0.0");
writePackumentFixtures("tiny-tarball");

async function writeManifestFixtures(spec: string) {
  await writeFixture(
    `test/fixtures/${spec}-abbreviated-manifest.ts`,
    await pacote.manifest(spec),
    "ManifestVersion",
    "ManifestResult"
  );
  await writeFixture(
    `test/fixtures/${spec}-manifest.ts`,
    await pacote.manifest(spec, { fullMetadata: true }),
    "PackumentVersion",
    "ManifestResult"
  );
}

async function writePackumentFixtures(spec: string) {
  await writeFixture(
    `test/fixtures/${spec}-abbreviated-packument.ts`,
    await pacote.packument(spec),
    "Manifest",
    "PackumentResult"
  );
  await writeFixture(
    `test/fixtures/${spec}-packument.ts`,
    await pacote.packument(spec, { fullMetadata: true }),
    "Packument",
    "PackumentResult"
  );
}

function writeFixture(
  filepath: string,
  metadata: unknown,
  metadataType: string,
  resultType: string
) {
  const source = `import * as pacote from "pacote";
import { ${metadataType} } from "../../";

export const metadata: ${metadataType} & pacote.${resultType} = ${JSON.stringify(
    metadata
  )};`;
  return fs.writeFile(filepath, prettier.format(source, { filepath }));
}

// Extra fields that e.g. only exist on pacote.manifest() results and not on packument versions objects, i.e. fields added by the pacote client vs. the npm registry.
// They're needed for the pacote.manifest() tests to pass, but they can't be on the manifest types or the pacote.packument() tests will fail.
declare module "pacote" {
  export interface ManifestResult {
    _id: string;
  }

  export interface PackumentResult {
    _cached: boolean;
    _contentLength: number;
  }
}
