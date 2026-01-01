import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import React from 'react';

export type SerializedHorizontalRuleNode = SerializedLexicalNode;

function convertHorizontalRuleElement(): DOMConversionOutput {
  return { node: $createHorizontalRuleNode() };
}

export class HorizontalRuleNode extends DecoratorNode<React.JSX.Element> {
  static getType(): string {
    return 'horizontalrule';
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(): HorizontalRuleNode {
    return $createHorizontalRuleNode();
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: convertHorizontalRuleElement,
        priority: 0,
      }),
    };
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('hr');
    element.setAttribute('class', 'blog-editor-hr');
    return { element };
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      type: 'horizontalrule',
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    return document.createElement('div');
  }

  getTextContent(): string {
    return '\n';
  }

  isInline(): false {
    return false;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.JSX.Element {
    return <hr className="blog-editor-hr" />;
  }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return new HorizontalRuleNode();
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode;
}
