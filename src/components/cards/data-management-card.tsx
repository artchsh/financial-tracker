import React from "react";
import { motion } from "framer-motion";
import { Download, FileText, Upload, Trash2 } from "lucide-react";
import { cardVariants } from "@/utils/animations";

interface DataManagementCardProps {
  isExporting: boolean;
  isImporting: boolean;
  isClearing: boolean;
  onExport: () => Promise<void> | void;
  onExportFormatted: () => Promise<void> | void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  onClear: () => Promise<void> | void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="font-semibold text-base">{children}</h4>;
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-secondary">{children}</p>;
}

export default function DataManagementCard({
  isExporting,
  isImporting,
  isClearing,
  onExport,
  onExportFormatted,
  onImport,
  onClear,
}: DataManagementCardProps) {
  return (
    <motion.div className="card" variants={cardVariants}>
      <h3 className="card-title mb-2">Data Management</h3>

      <div className="card-content gap-3">
        {/* Export */}
        <div className="flex flex-col gap-1">
          <SectionTitle>Export Data</SectionTitle>
          <SectionDescription>
            Download your budget data as a backup file.
          </SectionDescription>
          <div className="btn-group mt-1">
            <motion.button
              className="button btn-outline flex items-center justify-center gap-1"
              onClick={onExport}
              disabled={isExporting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isExporting ? (
                "Exporting..."
              ) : (
                <>
                  <Download size={16} />
                  JSON
                </>
              )}
            </motion.button>
            <motion.button
              className="button flex items-center justify-center gap-1"
              onClick={onExportFormatted}
              disabled={isExporting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isExporting ? (
                "Exporting..."
              ) : (
                <>
                  <FileText size={16} />
                  Text
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Import */}
        <div className="flex flex-col gap-1">
          <SectionTitle>Import Data</SectionTitle>
          <SectionDescription>
            Import data from a JSON file. This replaces all current data.
          </SectionDescription>
          <motion.label
            className="button button-secondary flex items-center justify-center gap-1 mt-1"
            style={{ cursor: "pointer" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isImporting ? (
              "Importing..."
            ) : (
              <>
                <Upload size={16} />
                Import Data
              </>
            )}
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              disabled={isImporting}
              style={{ display: "none" }}
            />
          </motion.label>
        </div>

        {/* Clear Data */}
        <div className="flex flex-col gap-1">
          <SectionTitle>Reset All Data</SectionTitle>
          <SectionDescription>
            Permanently delete all budget data. Cannot be undone.
          </SectionDescription>
          <motion.button
            className="button button-danger flex items-center justify-center gap-1 mt-1"
            onClick={onClear}
            disabled={isClearing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isClearing ? (
              "Clearing..."
            ) : (
              <>
                <Trash2 size={16} />
                Delete All Data
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
