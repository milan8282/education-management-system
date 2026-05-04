export const openUploadedFile = (file) => {
  if (!file?.url) {
    alert("File URL not found");
    return;
  }

  const url = file.url;
  const mimeType = file.mimeType || "";
  const lowerUrl = url.toLowerCase();

  const isPdf = mimeType === "application/pdf" || lowerUrl.includes(".pdf");

  const isDoc =
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerUrl.includes(".doc");

  if (isPdf) {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
    window.open(viewerUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (isDoc) {
    const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
      url
    )}`;

    window.open(viewerUrl, "_blank", "noopener,noreferrer");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};