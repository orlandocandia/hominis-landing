import { ContactosList } from '@/components/contactos-list';

export default function ProductorContactosPage() {
  // Productor sees all team contacts (API handles role-based filtering).
  // Detail links go to /vendedor/contactos/[id] (shared contact form).
  return <ContactosList newLinkBase="/vendedor/contactos" detailLinkBase="/vendedor/contactos" />;
}
