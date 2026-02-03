import React from "react";
import { motion } from "framer-motion";
import { Download, Upload, Trash2, FileSpreadsheet, FileJson } from "lucide-react";
import { cardVariants } from "@/utils/animations";

interface DataManagementCardProps {
  isExporting: boolean;
  isImporting: boolean;
  isClearing: boolean;
  onExportJson: () => Promise<void> | void;
  onExportCsv: () => Promise<void> | void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  onClear: () => Promise<void> | void;
}

export default function DataManagementCard({
  isExporting,
  isImporting,
  isClearing,
  onExportJson,
  onExportCsv,
  onImport,
  onClear,
}: DataManagementCardProps) {
  return (
    <motion.div className="card" variants={cardVariants}>
      <h3 className="card-title">Data Management</h3>

      <div className="card-content mt-2">
        {/* Export Section */}
        <div className="data-section">
          <div className="data-section-header">
            <Download size={18} className="data-section-icon" />
            <div>
              <h4 className="data-section-title">Export</h4>
              <p className="data-section-desc">Download your budget data</p>
            </div>
          </div>
          <div className="data-section-actions">
            <motion.button
              className="data-action-btn"
              onClick={onExportJson}
              disabled={isExporting}
              whileTap={{ scale: 0.97 }}
            >
              <FileJson size={18} />
              <span>JSON</span>
              <span className="data-action-hint">Backup</span>
            </motion.button>
            <motion.button
              className="data-action-btn"
              onClick={onExportCsv}
              disabled={isExporting}
              whileTap={{ scale: 0.97 }}
            >
              <FileSpreadsheet size={18} />
              <span>CSV</span>
              <span className="data-action-hint">Spreadsheet</span>
            </motion.button>
          </div>
        </div>

        {/* Import Section */}
        <div className="data-section">
          <div className="data-section-header">
            <Upload size={18} className="data-section-icon" />
            <div>
              <h4 className="data-section-title">Import</h4>
              <p className="data-section-desc">Restore from JSON backup</p>
            </div>
          </div>
          <motion.label
            className="data-action-btn data-action-btn-full"
            whileTap={{ scale: 0.97 }}
          >
            <FileJson size={18} />
            <span>{isImporting ? "Importing..." : "Select File"}</span>
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              disabled={isImporting}
              style={{ display: "none" }}
            />
          </motion.label>
        </div>

        {/* Clear Data Section */}
        <div className="data-section data-section-danger">
          <div className="data-section-header">
            <Trash2 size={18} className="data-section-icon" />
            <div>
              <h4 className="data-section-title">Reset</h4>
              <p className="data-section-desc">Delete all data permanently</p>
            </div>
          </div>
          <motion.button
            className="data-action-btn data-action-btn-danger"
            onClick={onClear}
            disabled={isClearing}
            whileTap={{ scale: 0.97 }}
          >
            <Trash2 size={18} />
            <span>{isClearing ? "Deleting..." : "Delete All"}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
