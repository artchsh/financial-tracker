import React from "react";
import { motion } from "framer-motion";
import { Download, FileText, Upload, Trash2 } from "lucide-react";
import { cardVariants } from "@/utils/animations";

export default function DataManagementCard({
  isExporting,
  isImporting,
  isClearing,
  onExport,
  onExportFormatted,
  onImport,
  onClear,
}: {
  isExporting: boolean;
  isImporting: boolean;
  isClearing: boolean;
  onExport: () => Promise<void> | void;
  onExportFormatted: () => Promise<void> | void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  onClear: () => Promise<void> | void;
}) {
  return (
    <motion.div className="card" variants={cardVariants}>
      <h2 className="font-bold">Data Management</h2>

      <motion.div layout className="flex flex-col gap-1">
        {/* Export */}
        <div className="">
          <h3 className="font-bold" style={{ fontSize: "1rem" }}>
            Export Data
          </h3>
          <p
            style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}
          >
            Download all your budget data as a JSON file for backup or transfer.
          </p>
          <div className="grid grid-cols-2">
            <motion.button
              className="flex justify-center items-center gap-1 bg-white border border-black rounded-l-lg h-10 text-black"
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
              className="flex justify-center items-center gap-1 bg-black px-2 border border-black rounded-r-lg h-10 text-white"
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
        <div className="flex flex-col gap-0.5">
          <h3 className="font-bold" style={{ fontSize: "1rem" }}>
            Import Data
          </h3>
          <p
            style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}
          >
            Import budget data from a JSON file. This will replace all current
            data.
          </p>
          <motion.label
            className="w-full button"
            style={{ display: "block", textAlign: "center", cursor: "pointer" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isImporting ? (
              "Importing..."
            ) : (
              <>
                <Upload
                  size={16}
                  style={{ display: "inline", marginRight: "0.5rem" }}
                />
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
        <div className="flex flex-col gap-0.5">
          <h3 className="font-bold" style={{ fontSize: "1rem" }}>
            Reset All Data
          </h3>
          <p
            style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}
          >
            Permanently delete all budget data. This action cannot be undone.
          </p>
          <motion.button
            className="flex gap-1 w-full button button-danger"
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
      </motion.div>
    </motion.div>
  );
}
