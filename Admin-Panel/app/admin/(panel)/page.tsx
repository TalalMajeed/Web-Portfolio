export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight text-gray-900">
        Dashboard
      </h2>
      <p className="text-sm text-gray-600">
        Use the navigation above to manage blog posts or adjust
        settings. This panel is only accessible to authenticated
        admins.
      </p>
    </div>
  );
}

