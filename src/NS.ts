"use strict";
import * as vscode from "vscode";

interface Block {
    namespace : string;
    range : vscode.Range;
}

export class Namespace {
    patterns : RegExp[] = [
        /namespace\s*\(\s*(['"])\s*([^'"]+)\1/g,
        /['\"]namespace['"]\s*=>\s*(['"])([^'"]+)\1/g,
        /controller\s*\(\s*[^)]+/g,
    ];
    document: vscode.TextDocument;
    fullText : string;

	constructor(document: vscode.TextDocument) {
        this.document = document;
		this.fullText = document.getText();
	}

    /**
     * find the namespace of the selection
     * @param document
     * @param selection
     */
    public find(selection: vscode.Range) : string
    {
        let blocks = this.blocks(selection);
        for (const closure of blocks.reverse()) {
            if ((closure.range as vscode.Range).contains(selection)) {
                return closure.namespace;
            }
        }

        return '';
    }

    /**
     * get all closure blocks
     * @param selection
     */
    public blocks(selection: vscode.Range) : Array<Block> {
        let match;
        let blocks : Array<any> = [];
        for (const pattern of this.patterns) {
            while ((match = pattern.exec(this.fullText)) !== null) {
                let start = this.document.positionAt(match.index);
                if (selection.start.isAfter(start)) {
                    blocks.push({
                        namespace: match[2].trim(),
                        range: new vscode.Range(
                            this.document.positionAt(match.index),
                            this.document.positionAt(this.getEndPosition(match.index))
                        )
                    });
                }
            }
        }

        return blocks;
    }

    /**
     * get the end position from the start position
     * @param start
     */
    private getEndPosition(start: number) : number
    {
        let result : number[] = [];
        const length = this.fullText.length;
        while(length > start++) {
            if ('{' === this.fullText[start]) {
                result.push(start);
            } else if ('}' === this.fullText[start]) {
                result.pop();
                if (0 === result.length) {
                    return start;
                }
            }
        }

        return start;
    }
}
