import {Tag} from "@cere-ddc-sdk/content-addressable-storage";
import {DdcClient, PieceArray} from "@cere-ddc-sdk/ddc-client";
import {DEVNET, TESTNET} from "@cere-ddc-sdk/smart-contract";
import {u8aToHex} from "@polkadot/util";
import {InjectedAccount} from "@polkadot/extension-inject/types";

const MNEMONIC_BOB = "grass smooth rain offer matter senior crucial slim clip news town opera"
const MNEMONIC_ALICE = "little absent donor alcohol dynamic unit throw laptop boring tissue pen design";
const bucketId = 1n;
const cdnUrl = "http://localhost:8080";

// Secret Bob's Data
const secretData = new Uint8Array([0, 1, 2, 3, 4, 5]);
const topSecretDataTag = new Tag("data-status", "top_secret");

// Public Bob's Data
const publicData = new Uint8Array([10, 11, 12, 13, 14, 15]);
const publicDataTag = new Tag("data-status", "public");

// DEK paths
const mainDekPath = "bob/data/secret";
const subDekPath = "bob/data/secret/some";

export const extensionUpload = async (acc: InjectedAccount) => {
    console.log("========================= Initialize =========================");
    // Init Bob client
    const ddcClientBob = await DdcClient.buildAndConnect({clusterAddress: cdnUrl, smartContract: TESTNET}, acc, MNEMONIC_BOB);

    console.log("========================= Store =========================");
    // Store encrypted data
    const secretPieceArray = new PieceArray(secretData, [topSecretDataTag]);
    const secretUri = await ddcClientBob.store(bucketId, secretPieceArray, {encrypt: true, dekPath: subDekPath});
    console.log(`Secret URI: ${secretUri}`)

    // Store unencrypted data
    const publicPieceArray = new PieceArray(publicData, [publicDataTag]);
    const publicUri = await ddcClientBob.store(bucketId, publicPieceArray);
    console.log(`Public URI: ${publicUri}`)


    console.log("========================= Read data for Bob =========================");
    // Read secret data without decryption
    console.log("Read encrypted data for Bob:");
    let pieceArray = await ddcClientBob.read(secretUri);
    await readData(pieceArray);
    console.log("=========================");

    // Read secret decrypted data
    console.log("Read decrypted data for Bob:");
    pieceArray = await ddcClientBob.read(secretUri, {dekPath: subDekPath, decrypt: true});
    await readData(pieceArray);
    console.log("=========================");

    // Read public data
    console.log("Read public data for Bob:");
    pieceArray = await ddcClientBob.read(publicUri);
    await readData(pieceArray);
    console.log("=========================");


    console.log("========================= Share data for Alice =========================");
    // Init Alice client
    const ddcClientAlice = await DdcClient.buildAndConnect({
        clusterAddress: cdnUrl,
        smartContract: TESTNET
    }, MNEMONIC_ALICE);
    // Share DEK
    await ddcClientBob.shareData(bucketId, mainDekPath, u8aToHex(ddcClientAlice.boxKeypair.publicKey));


    console.log("========================= Read data for Alice =========================");
    // Read public data
    console.log("Read public data for Alice:");
    pieceArray = await ddcClientAlice.read(publicUri);
    await readData(pieceArray);
    console.log("=========================");

    // Read secret decrypted data
    console.log("Read decrypted data for Alice:");
    pieceArray = await ddcClientAlice.read(secretUri, {dekPath: mainDekPath, decrypt: true});
    await readData(pieceArray);
    console.log("=========================");

    console.log("========================= Disconnect =========================");
    await ddcClientBob.disconnect();
    await ddcClientAlice.disconnect();
}

const readData = async (pieceArray: PieceArray) => {
    for await (const data of pieceArray.dataReader()) {
        console.log(`Data Uint8Array: ${data}`)
    }
}