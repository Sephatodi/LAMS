 
 
/** @jsxRuntime classic */
/** @jsx React.createElement */

import axios from "axios";
import { saveAs } from "file-saver";
import { useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";

const CertificateDownload = ({ plotId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadCertificate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/transfer/download-certificate/${plotId}`, {
        responseType: "blob",
      });
      saveAs(response.data, `ownership-transfer-${plotId}.pdf`);
    } catch (error) {
      setError("Error downloading certificate. Please try again later.");
      console.error("Error downloading certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={handleDownloadCertificate} disabled={loading}>
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="me-2" />
            Download Transfer Certificate
          </>
        )}
      </Button>
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    </div>
  );
};

export default CertificateDownload;