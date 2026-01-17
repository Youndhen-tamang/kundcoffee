import QRCodeCell from "@/components/QrCodeCell";

export default async function QRCodesPage() {
  const res = await fetch("http://localhost:3000/api/qrcodes", {
    cache: "no-store",
  });

  const { qr } = await res.json();
  
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">QR Codes</h1>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="border-b text-left">
            <th className="p-3">QR</th>
            <th>Assigned</th>
          </tr>
        </thead>
        <tbody>
          {qr.map((item: any) => (
            <tr key={item.id} className="border-b">
              <td className="p-3">
                <QRCodeCell value={item.value} />
              </td>
              <td>{item.assigned ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
