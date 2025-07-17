/** @jsxRuntime classic */
/** @jsx React.createElement */

import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import  React, { useState } from 'react';
import styles from './styles.module.css';

const DocumentViewer = ({ fileUrl, fileType }) => {
  const [isOfficeFile, setIsOfficeFile] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Check file type on component mount and when props change
  useEffect(() => {
    setIsOfficeFile(['docx', 'xlsx', 'pptx'].includes(fileType));
  }, [fileType]);

  if (!fileUrl) {
    return (
      <div className={styles.emptyState}>
        <p>No document selected</p>
      </div>
    );
  }

  if (isOfficeFile) {
    return (
      <div className={styles.officeViewer}>
        <iframe 
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
          width="100%"
          height="600px"
          frameBorder="0"
          title="Document Viewer"
        />
      </div>
    );
  }

  return (
    <div className={styles.pdfViewer}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.jsx">
        <Viewer 
          fileUrl={fileUrl} 
          plugins={[defaultLayoutPluginInstance]}
        />
      </Worker>
    </div>
  );
};

export default DocumentViewer;