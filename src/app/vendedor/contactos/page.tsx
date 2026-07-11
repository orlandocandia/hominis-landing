import { ContactosList } from '@/components/contactos-list';

export default function VendedorContactosPage() {
  return <ContactosList newLinkBase="/vendedor/contactos" detailLinkBase="/vendedor/contactos" />;
}
