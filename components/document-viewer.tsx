"use client";

import { useMelonyPart } from "melony";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  BookOpen,
  Hash,
  Type,
} from "lucide-react";
import { Response } from "@/components/ai-elements/response";
import { ChatMessagePartType } from "./chat-messages";

interface DocumentData {
  status: "starting" | "processing" | "completed";
  title: string;
  progress: number;
  message: string;
  currentSection?: string;
  documentPreview?: string;
  fullDocument?: string;
  format?: string;
  wordCount?: number;
  characterCount?: number;
}

interface DocumentViewerProps {
  documentId?: string;
  className?: string;
}

export default function DocumentViewer({
  documentId,
  className,
}: DocumentViewerProps) {
  const [documents, setDocuments] = useState<Map<string, DocumentData>>(
    new Map()
  );
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(
    documentId || null
  );

  // Listen for document-related parts from the stream
  useMelonyPart<ChatMessagePartType>((part) => {
    if (part.type === "data-document") {
      const data = part.data as DocumentData;
      const docId = part.id as string;

      setDocuments((prev) => {
        const newDocs = new Map(prev);
        newDocs.set(docId, data);
        return newDocs;
      });

      // Set as active document if it's the first one or if specified
      if (!activeDocumentId || (documentId && docId === documentId)) {
        setActiveDocumentId(docId);
      }
    }
  });

  const activeDocument = activeDocumentId
    ? documents.get(activeDocumentId)
    : null;
  const documentList = Array.from(documents.entries());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "starting":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "starting":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (documentList.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No documents yet
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Start a conversation and ask me to create a document to see it
            appear here in real-time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Document List Sidebar */}
      {documentList.length > 1 && (
        <Card className="w-80 flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documentList.map(([id, doc]) => (
              <div
                key={id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeDocumentId === id
                    ? "bg-primary/5 border-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setActiveDocumentId(id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(doc.status)}
                  <span className="text-sm font-medium truncate">
                    {doc.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(doc.status)}`}
                  >
                    {doc.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {doc.progress}%
                  </span>
                </div>
                <Progress value={doc.progress} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Document Viewer */}
      <Card className="flex-1 flex flex-col gap-0 h-full">
        {activeDocument ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(activeDocument.status)}
                  <div>
                    <CardTitle className="text-lg">
                      {activeDocument.title}
                    </CardTitle>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getStatusColor(activeDocument.status)}
                    >
                      {activeDocument.status}
                    </Badge>
                    {activeDocument.format && (
                      <Badge variant="secondary" className="text-xs">
                        {activeDocument.format.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      <span>{activeDocument.progress}% complete</span>
                    </div>
                    {activeDocument.currentSection && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Working on: {activeDocument.currentSection}</span>
                      </div>
                    )}
                    {activeDocument.wordCount && (
                      <div className="flex items-center gap-1">
                        <Type className="h-4 w-4" />
                        <span>{activeDocument.wordCount} words</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {activeDocument.message}
                  </p>
                </div>

                <Progress value={activeDocument.progress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 h-full overflow-hidden">
              <div className="h-full overflow-auto">
                <div className="p-6">
                  {activeDocument.status === "completed" &&
                  activeDocument.fullDocument ? (
                    <Response>{activeDocument.fullDocument}</Response>
                  ) : activeDocument.documentPreview ? (
                    <div className="space-y-4">
                      <Response>{activeDocument.documentPreview}</Response>
                      {activeDocument.status === "processing" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Generating more content...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {activeDocument.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            {/* Document Statistics */}
            {activeDocument.status === "completed" && (
              <div className="border-t p-6 pb-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Words: {activeDocument.wordCount || 0}</span>
                    <span>
                      Characters: {activeDocument.characterCount || 0}
                    </span>
                    <span>Format: {activeDocument.format || "markdown"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Document completed</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
              <p className="text-muted-foreground">Select a document to view</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
