import IPFS from "ipfs-core";
import * as tmp from "tmp-promise";
import * as dagJose from "dag-jose";
import { convert } from "blockcodec-to-ipld-format";
import Ceramic from "@ceramicnetwork/core";
import { Ed25519Provider } from "key-did-provider-ed25519";
import * as sha256 from "@stablelib/sha256";
import * as uint8arrays from "uint8arrays";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import KeyDidResolver from "key-did-resolver";
import { Resolver } from "did-resolver";
import { DID } from "dids";
import ThreeIdProvider from "3id-did-provider";

async function createIPFS() {
  const repo = await tmp.dir({ unsafeCleanup: true });
  const format = convert(dagJose);
  const ipfs = await IPFS.create({
    repo: repo.path,
    ipld: { formats: [format] },
  });
  return ipfs;
}

async function main() {
  const ipfs = await createIPFS();
  const ceramic = await Ceramic.create(ipfs, { networkName: "testnet-clay" });

  const seed = sha256.hash(uint8arrays.fromString("hello"));
  const edProvider = new Ed25519Provider(seed);

  const keyDidResolver = KeyDidResolver.getResolver();
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic);
  const resolver = new Resolver({
    ...threeIdResolver,
    ...keyDidResolver,
  });
  // const did = new DID({ provider: edProvider, resolver });
  // await did.authenticate()
  // console.log('---did:', did.id)
  const threeIdProvider = await ThreeIdProvider.create({
    getPermission: async () => [],
    authSecret: seed,
    authId: "init",
    ceramic: ceramic,
  });
  console.log('done')
}

main();
