"use client";
import { FileManagerSidenav } from "@/components/file-manager/FileManagerSidenav";
import { FolderOpen } from "lucide-react";

export default function FilesPage() {
  return (
    <div className="p-8 min-h-screen max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-4">
          <FolderOpen className="h-10 w-10 text-blue-600" />
          File Manager
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload, organize, and manage your files for Python execution.
        </p>
      </div>
      <FileManagerSidenav />
    </div>
  );
}