import { VendorForm } from '@/components/vendor-form';

export default async function EditarVendedorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VendorForm userId={id} />;
}
