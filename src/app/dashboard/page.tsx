import ImageUploader from '../../components/ImageUploader';

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">🚀 Welcome to your dashboard!</h1>
      <p>You are signed in. Build away!</p>
      <ImageUploader />
    </div>
  );
}
