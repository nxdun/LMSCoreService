import { useState } from "react";
import { Card, CardContent, Button, Box, Typography, CircularProgress } from "@mui/material";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setUploadResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_AUTH_SERVER}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadResult(data);
      setFile(null);
    } catch (err) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Upload File</Typography>
        
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <input
              accept="image/*,video/*,application/pdf"
              style={{ display: "none" }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
              name="file"
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
              >
                Select File
              </Button>
            </label>
            {file && (
              <Typography variant="body2" mt={1}>
                Selected: {file.name}
              </Typography>
            )}
          </Box>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!file || uploading}
          >
            {uploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Uploading...
              </Box>
            ) : "Upload"}
          </Button>
        </form>
        
        {error && (
          <Box mt={2} p={1} bgcolor="error.light" borderRadius={1}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        {uploadResult && (
          <Box mt={2} p={1} bgcolor="success.light" borderRadius={1}>
            <Typography variant="subtitle2">File uploaded successfully!</Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              URL: {uploadResult.fileUrl}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Upload;
