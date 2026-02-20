const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(value);

export const buildCertificateNumber = (qrcode) =>
  `OW-${qrcode.uuid.slice(0, 8).toUpperCase()}-${qrcode.claimedAt.getFullYear()}`;

export const buildWarrantyCertificate = (qrcode) => ({
  certificateNumber: buildCertificateNumber(qrcode),
  warrantyId: qrcode.uuid,
  customer: {
    name: qrcode.claimedBy?.name,
    email: qrcode.claimedBy?.email,
  },
  product: {
    name: qrcode.product?.name,
    modelNumber: qrcode.product?.modelNumber,
    category: qrcode.product?.category,
  },
  coverage: {
    claimedAt: formatDate(qrcode.claimedAt),
    expiresAt: formatDate(qrcode.expiresAt),
  },
  issuedAt: formatDate(new Date()),
});

