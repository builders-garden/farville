export default function CopyNotification({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed text-md top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-md z-[9999] shadow-lg">
      Copied to clipboard!
    </div>
  );
}
