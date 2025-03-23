import { Card, CardContent, Button } from "@mui/material";

const Upload = () => {
  return (
    <Card>
      <CardContent>
        <form
          action={`${import.meta.env.VITE_AUTH_SERVER}/upload`}
          method="post"
          encType="multipart/form-data"
        >
          <input
            accept="image/*"
            className="classes.input"
            style={{ display: "none" }}
            id="raised-button-file"
            multiple
            type="file"
            name="file"
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="raised"
              component="span"
              className="classes-button"
            >
              Upload
            </Button>
          </label>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Upload;
