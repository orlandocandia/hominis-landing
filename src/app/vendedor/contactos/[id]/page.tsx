import { ContactForm } from '@/components/contact-form';

export default async function EditarContactoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContactForm contactId={id} />;
}
