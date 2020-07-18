"use strict";
import * as vscode from "vscode";

export class Namespace {
    patterns : Array<RegExp> = [
        /namespace\s*\(\s*(['"])\s*([^'"]+)\1/g,
        /['\"]namespace['"]\s*=>\s*(['"])([^'"]+)\1/g,
    ];
    fullText : string = '';

    /**
     * find the namespace of the selection
     * @param document
     * @param selection
     */
    public find(document: vscode.TextDocument, selection: vscode.Range) : string
    {
        this.fullText = document.getText();
        let blocks = this.blocks(document, selection);
        for (const closure of blocks.reverse()) {
            if ((closure.range as vscode.Range).contains(selection)) {
                return closure.namespace;
            }
        }

        return '';
    }

    /**
     * get all closure blocks
     * @param document
     * @param selection
     */
    private blocks(document: vscode.TextDocument , selection: vscode.Range) : Array<any> {
        let match;
        let blocks : Array<any> = [];
        for (const pattern of this.patterns) {
            while ((match = pattern.exec(this.fullText)) != null) {
                let start = document.positionAt(match.index);
                if (selection.start.isAfter(start)) {
                    blocks.push({
                        namespace: match[2],
                        range: new vscode.Range(
                            document.positionAt(match.index),
                            document.positionAt(this.getEndPosition(match.index))
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
                result.pop() as number;
                if (0 === result.length) {
                    return start;
                }
            }
        }

        return start;
    }
}
