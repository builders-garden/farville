import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { merkleValues } from "../../../lib/og-nft/merkle-root/merkleValues";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Generate the Merkle tree
    const tree = StandardMerkleTree.of(merkleValues, ["address", "uint256"]);

    // Store the root
    const root = tree.root;
    // Save the root to the merkleRoot.json file in the lib/og-nft/merkle-root/ directory
    fs.writeFileSync(
      path.join(process.cwd(), "lib", "og-nft", "merkle-root", "merkleRoot.json"),
      JSON.stringify(tree.dump())
    );

    return NextResponse.json({
      success: true,
      root,
      message: "Merkle tree generated successfully",
    });
  } catch (error) {
    console.error("Error generating Merkle tree:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate Merkle tree",
      },
      { status: 500 }
    );
  }
}
