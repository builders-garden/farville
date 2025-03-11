import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { address, nftId } = await request.json();

    if (!address || !nftId) {
      return NextResponse.json(
        { error: "Address and NFT ID are required" },
        { status: 400 }
      );
    }

    // Load the Merkle tree from the JSON file
    const treeFilePath = path.join(
      process.cwd(),
      "lib",
      "og-nft",
      "merkle-root",
      "merkleRoot.json"
    );
    const tree = StandardMerkleTree.load(
      JSON.parse(fs.readFileSync(treeFilePath, "utf8"))
    );

    // Find the leaf and get the proof
    let proof = null;
    let value = null;

    for (const [i, v] of tree.entries()) {
      if (v[0].toLowerCase() === address.toLowerCase() && v[1] === nftId) {
        proof = tree.getProof(i);
        value = v;
        break;
      }
    }

    if (!proof) {
      return NextResponse.json(
        { error: "No proof found for the given address and NFT ID" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      proof,
      value,
    });
  } catch (error) {
    console.error("Error generating proof:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
