// GET /api/i18n/[locale] — returns full translation JSON for the requested locale
import { NextResponse } from 'next/server';

// Dashboard translations from messages/{locale}.json (loaded at build time)
import dashboardEs from '@/../messages/es.json';
import dashboardEn from '@/../messages/en.json';
import dashboardPt from '@/../messages/pt.json';

const DASHBOARD_TRANSLATIONS: Record<string, any> = {
  es: dashboardEs,
  en: dashboardEn,
  pt: dashboardPt,
};

const ES = {
  landing: {
    nav: { home: 'Inicio', about: 'Sobre Mí', plans: 'Planes', promotions: 'Promos', services: 'Servicios', branch: 'Sucursal', contact: 'Contacto' },
    hero: {
      title: 'Tu bienestar,', titleHighlight: 'mi compromiso',
      subtitle: 'Asesoría personalizada en planes de salud Hominis con más de 10 años de experiencia. Te ayudo a elegir entre Vita Más y Aqua Más, dos planes con la misma calidad médica y diferente forma de pagar.',
      cta: 'Solicitar Asesoramiento',
      stats: { clients: 'Clientes Asesorados', experience: 'Años de Experiencia', satisfaction: 'Satisfacción' },
    },
    about: { title: 'Sobre Mí', description: 'Soy Agustina C. Candia, asesora comercial de Hominis con más de 10 años de experiencia en el sector salud.', features: ['Atención personalizada', 'Respuesta inmediata', 'Asesoramiento gratuito'] },
    plans: { title: 'Planes de Salud', subtitle: 'Elegí el plan que se adapte a tu forma de pagar', vita: { name: 'Vita Más', badge: 'Premium', features: ['Sin copagos', 'Urgencias 24/7 sin copagos', 'Odontología sin cargo', 'Experiencia Concierge 24/7', 'Asistencia al viajero incluida', 'Farmacia incluida'], cta: 'Contratar Vita Más' }, aqua: { name: 'Aqua Más', badge: 'Ahorro', features: ['Copagos flexibles', 'Urgencias 24/7 sin copagos', 'Odontología con coseguro', 'Asistencia al viajero incluida', 'Farmacia 40% descuento'], cta: 'Contratar Aqua Más' } },
    promotions: { title: 'Promociones', subtitle: 'Descuentos escalonados para nuevos socios que adhieran al débito automático', period: 'Período', aqua: 'Aqua Más', vita: 'Vita Más', months: { '1_3': 'Meses 1 a 3', '4_6': 'Meses 4 a 6', '7_12': 'Meses 7 a 12' }, note: 'Las promociones aplican para nuevos socios de hasta 39 años.' },
    services: { title: 'Servicios Digitales', virtual_doctor: { title: 'Médico Virtual', description: 'Consultas por videollamada desde la app Hominis, sin necesidad de moverte de tu casa.' }, virtual_pharmacy: { title: 'Farmacia Virtual', description: 'Pedí tus medicamentos con 40% de cobertura y recibilos en tu domicilio.' }, digital_management: { title: 'Gestión Digital', description: 'Accedé a tu historial médico, turnos y documentación desde cualquier dispositivo.' } },
    branch: { title: 'Sucursal', address: 'Portela 266, Lomas de Zamora, PBA', schedule: 'Lunes a Viernes de 9:00 a 18:00', closed: 'Sábados y Domingos: Cerrado', phone: '11-6555-5534', cta: 'Coordinar visita por WhatsApp' },
    contact: { title: 'Contacto', subtitle: 'Completá el formulario y me comunico con vos en menos de 24 horas.', form: { name: 'Nombre completo', name_placeholder: 'Ej: María González', email: 'Email', email_placeholder: 'ej: maria@email.com', phone: 'Teléfono / WhatsApp', phone_placeholder: 'Ej: 11-5555-1234', segment: 'Situación laboral', age: 'Edad', age_placeholder: 'Ej: 32', coverage: 'Cobertura de interés', message: 'Mensaje', message_placeholder: 'Contanos qué plan te interesa...', submit: 'Enviar Solicitud' }, options: { segment: { payroll: 'Recibo de sueldo', monotributo: 'Monotributo', selfEmployed: 'Particular' }, coverage: { caba: 'CABA', gba: 'GBA' } }, success: '¡Solicitud enviada con éxito! Te contactaré en menos de 24 horas.' },
    footer: { copyright: '© 2025 Hominis - Asesoría de Salud. Todos los derechos reservados.' },
  },
  theme: { light: 'Claro', dark: 'Oscuro', system: 'Sistema' },
  language: { es: 'Español', en: 'English', pt: 'Portugués' },
  auth: { login: { title: 'Panel de Gestión', subtitle: 'Ingresá tus credenciales para acceder al dashboard', email: 'Email', password: 'Contraseña', submit: 'Ingresar', error: 'Credenciales inválidas', back: 'Volver al sitio', note: 'Acceso exclusivo para personal autorizado. Las credenciales son encriptadas y protegidas.' } },
  dashboard: {
    title: 'Panel de Administración', vendedor_title: 'Panel de Vendedor', productor_title: 'Panel de Productor', welcome: 'Bienvenida/o',
    stats: { total: 'Total Contactos', new: 'Nuevos', attended: 'Atendidos', rejected: 'Rechazados', conversion: 'Conversión', activeVendors: 'Vendedores Activos', teamContacts: 'Contactos del Equipo', teamConversion: 'Conversión Equipo', leads: 'Leads Totales', newLeads: 'Leads sin Atender' },
    actions: { newContact: 'Nuevo contacto', viewPipeline: 'Pipeline', viewMap: 'Mapa', viewProfile: 'Mi Perfil', viewContacts: 'Contactos', viewTeam: 'Equipo', viewMarketing: 'Marketing', viewReports: 'Reportes', viewRanking: 'Ranking', viewInvitations: 'Invitaciones' },
    sidebar: { dashboard: 'Dashboard', vendedores: 'Vendedores', contactos: 'Contactos', mapa: 'Mapa', invitaciones: 'Invitaciones', marketing: 'Marketing', reportes: 'Reportes', ranking: 'Ranking', pipeline: 'Pipeline', perfil: 'Perfil' },
  },
  admin: {
    vendedores: { title: 'Vendedores', activeUsers: '{count} usuarios activos', all: 'Todos', filters: { all: 'Todos', vendedor: 'Vendedores', productor: 'Productores' }, stats: { contacts: 'contactos', conversion: 'conversión' }, empty: 'No hay vendedores cargados.', create: 'Nuevo vendedor' },
    contactos: { title: 'Todos los contactos', empty: 'No hay contactos en el CRM todavía.' },
    marketing: { title: 'Dashboard de Marketing', totalLeads: 'Leads totales', costPerLead: 'Costo por Lead', conversionRate: 'Tasa Conversión', roi: 'ROI', bySource: 'Fuentes de leads', dailyTrend: 'Tendencia diaria' },
    reportes: { title: 'Reportes Avanzados', sales: 'Ventas', performance: 'Rendimiento', export: 'Exportar Excel', from: 'Desde', to: 'Hasta' },
    leaderboard: { title: 'Leaderboard', rank: 'Posición', points: 'puntos', level: 'Nivel', badges: 'Insignias', availableBadges: 'Badges disponibles', pointsSystem: 'Cómo sumar puntos' },
    invitaciones: { title: 'Invitaciones', send: 'Invitar', newInvitation: 'Nueva invitación', email: 'Email del invitado', role: 'Rol', empty: 'No hay invitaciones enviadas todavía.' },
    mapa: { title: 'Mapa global', subtitle: 'Todos los vendedores con su radio de cobertura + todos los contactos del CRM' },
  },
  vendedor: {
    contactos: { title: 'Contactos', nuevo: 'Nuevo contacto', empty: 'No hay contactos.', search: 'Buscar por nombre, email, teléfono...' },
    pipeline: { title: 'Pipeline de Ventas', dragHint: 'Arrastrá las tarjetas entre columnas para cambiar el estado.' },
    mapa: { title: 'Mapa de mi cartera', empty: 'No hay contactos con ubicación cargada.' },
    perfil: { title: 'Mi Perfil' },
  },
  productor: {
    contactos: { title: 'Contactos del equipo' },
    mapa: { title: 'Mapa del equipo', subtitle: 'Vendedores con radio de cobertura + todos los contactos del equipo' },
    perfil: { title: 'Mi Perfil' },
  },
  common: {
    loading: 'Cargando...', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', view: 'Ver',
    search: 'Buscar', all: 'Todos', close: 'Cerrar', back: 'Volver', create: 'Crear', logout: 'Cerrar Sesión',
    contactos: 'contactos', conv: 'conv.', score: 'Score', status: 'Estado', segment: 'Segmento',
    conversions: 'conversiones', recordatorios: 'Próximos recordatorios', noPending: 'Sin recordatorios pendientes. ¡Todo al día!',
    contactosRecientes: 'Contactos recientes', miCartera: 'Mi cartera', miProgreso: 'Mi progreso',
    paraNivel: 'pts para nivel', ganáPuntos: 'Ganá puntos creando contactos, agendando reuniones y cerrando ventas',
  },
};

const EN = {
  landing: {
    nav: { home: 'Home', about: 'About Me', plans: 'Plans', promotions: 'Promos', services: 'Services', branch: 'Branch', contact: 'Contact' },
    hero: {
      title: 'Your well-being,', titleHighlight: 'my commitment',
      subtitle: 'Personalized health insurance advisory with over 10 years of experience. I help you choose between Vita Más and Aqua Más, two plans with the same medical quality and different ways to pay.',
      cta: 'Request Consultation',
      stats: { clients: 'Clients Advised', experience: 'Years of Experience', satisfaction: 'Satisfaction' },
    },
    about: { title: 'About Me', description: 'I am Agustina C. Candia, a commercial advisor at Hominis with over 10 years of experience in the healthcare sector.', features: ['Personalized attention', 'Immediate response', 'Free consultation'] },
    plans: { title: 'Health Plans', subtitle: 'Choose the plan that fits your way of paying', vita: { name: 'Vita Más', badge: 'Premium', features: ['No copays', '24/7 emergencies without copays', 'Dentistry at no cost', 'Concierge experience 24/7', 'Travel assistance included', 'Pharmacy included'], cta: 'Get Vita Más' }, aqua: { name: 'Aqua Más', badge: 'Savings', features: ['Flexible copays', '24/7 emergencies without copays', 'Dentistry with co-insurance', 'Travel assistance included', 'Pharmacy 40% discount'], cta: 'Get Aqua Más' } },
    promotions: { title: 'Promotions', subtitle: 'Tiered discounts for new members who sign up for automatic debit', period: 'Period', aqua: 'Aqua Más', vita: 'Vita Más', months: { '1_3': 'Months 1 to 3', '4_6': 'Months 4 to 6', '7_12': 'Months 7 to 12' }, note: 'Promotions apply to new members up to 39 years old.' },
    services: { title: 'Digital Services', virtual_doctor: { title: 'Virtual Doctor', description: 'Video call consultations from the Hominis app, without leaving your home.' }, virtual_pharmacy: { title: 'Virtual Pharmacy', description: 'Order your medications with 40% coverage and get them delivered to your home.' }, digital_management: { title: 'Digital Management', description: 'Access your medical history, appointments and documentation from any device.' } },
    branch: { title: 'Branch', address: 'Portela 266, Lomas de Zamora, PBA', schedule: 'Monday to Friday 9:00 AM to 6:00 PM', closed: 'Saturdays and Sundays: Closed', phone: '11-6555-5534', cta: 'Schedule a visit via WhatsApp' },
    contact: { title: 'Contact', subtitle: "Fill out the form and I'll get back to you in less than 24 hours.", form: { name: 'Full name', name_placeholder: 'e.g. Maria Gonzalez', email: 'Email', email_placeholder: 'e.g. maria@email.com', phone: 'Phone / WhatsApp', phone_placeholder: 'e.g. 11-5555-1234', segment: 'Employment status', age: 'Age', age_placeholder: 'e.g. 32', coverage: 'Area of interest', message: 'Message', message_placeholder: 'Tell us which plan you are interested in...', submit: 'Send Request' }, options: { segment: { payroll: 'Payroll employee', monotributo: 'Monotributo', selfEmployed: 'Self-employed' }, coverage: { caba: 'CABA', gba: 'GBA' } }, success: 'Request sent successfully! I will contact you within 24 hours.' },
    footer: { copyright: '© 2025 Hominis - Health Advisory. All rights reserved.' },
  },
  theme: { light: 'Light', dark: 'Dark', system: 'System' },
  language: { es: 'Español', en: 'English', pt: 'Português' },
  auth: { login: { title: 'Management Panel', subtitle: 'Enter your credentials to access the dashboard', email: 'Email', password: 'Password', submit: 'Sign In', error: 'Invalid credentials', back: 'Back to site', note: 'Exclusive access for authorized personnel. Credentials are encrypted and protected.' } },
  dashboard: {
    title: 'Admin Dashboard', vendedor_title: 'Vendor Dashboard', productor_title: 'Producer Dashboard', welcome: 'Welcome',
    stats: { total: 'Total Contacts', new: 'New', attended: 'Attended', rejected: 'Rejected', conversion: 'Conversion', activeVendors: 'Active Vendors', teamContacts: 'Team Contacts', teamConversion: 'Team Conversion', leads: 'Total Leads', newLeads: 'Unattended Leads' },
    actions: { newContact: 'New Contact', viewPipeline: 'Pipeline', viewMap: 'Map', viewProfile: 'My Profile', viewContacts: 'Contacts', viewTeam: 'Team', viewMarketing: 'Marketing', viewReports: 'Reports', viewRanking: 'Ranking', viewInvitations: 'Invitations' },
    sidebar: { dashboard: 'Dashboard', vendedores: 'Vendors', contactos: 'Contacts', mapa: 'Map', invitaciones: 'Invitations', marketing: 'Marketing', reportes: 'Reports', ranking: 'Ranking', pipeline: 'Pipeline', perfil: 'Profile' },
  },
  admin: {
    vendedores: { title: 'Vendors', activeUsers: '{count} active users', all: 'All', filters: { all: 'All', vendedor: 'Vendors', productor: 'Producers' }, stats: { contacts: 'contacts', conversion: 'conversion' }, empty: 'No vendors found.', create: 'New Vendor' },
    contactos: { title: 'All Contacts', empty: 'No contacts in the CRM yet.' },
    marketing: { title: 'Marketing Dashboard', totalLeads: 'Total Leads', costPerLead: 'Cost per Lead', conversionRate: 'Conversion Rate', roi: 'ROI', bySource: 'Lead Sources', dailyTrend: 'Daily Trend' },
    reportes: { title: 'Advanced Reports', sales: 'Sales', performance: 'Performance', export: 'Export Excel', from: 'From', to: 'To' },
    leaderboard: { title: 'Leaderboard', rank: 'Rank', points: 'points', level: 'Level', badges: 'Badges', availableBadges: 'Available Badges', pointsSystem: 'How to earn points' },
    invitaciones: { title: 'Invitations', send: 'Invite', newInvitation: 'New Invitation', email: 'Invitee email', role: 'Role', empty: 'No invitations sent yet.' },
    mapa: { title: 'Global Map', subtitle: 'All vendors with coverage radius + all CRM contacts' },
  },
  vendedor: {
    contactos: { title: 'Contacts', nuevo: 'New Contact', empty: 'No contacts.', search: 'Search by name, email, phone...' },
    pipeline: { title: 'Sales Pipeline', dragHint: 'Drag cards between columns to change their status.' },
    mapa: { title: 'My Portfolio Map', empty: 'No contacts with location data.' },
    perfil: { title: 'My Profile' },
  },
  productor: {
    contactos: { title: 'Team Contacts' },
    mapa: { title: 'Team Map', subtitle: 'Vendors with coverage radius + all team contacts' },
    perfil: { title: 'My Profile' },
  },
  common: {
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', view: 'View',
    search: 'Search', all: 'All', close: 'Close', back: 'Back', create: 'Create', logout: 'Sign Out',
    contactos: 'contacts', conv: 'conv.', score: 'Score', status: 'Status', segment: 'Segment',
    conversions: 'conversions', recordatorios: 'Upcoming Reminders', noPending: 'No pending reminders. All caught up!',
    contactosRecientes: 'Recent Contacts', miCartera: 'My Portfolio', miProgreso: 'My Progress',
    paraNivel: 'pts to next level', ganáPuntos: 'Earn points by creating contacts, scheduling meetings and closing sales',
  },
};

const PT = {
  landing: {
    nav: { home: 'Início', about: 'Sobre Mim', plans: 'Planos', promotions: 'Promoções', services: 'Serviços', branch: 'Filial', contact: 'Contato' },
    hero: {
      title: 'Seu bem-estar,', titleHighlight: 'meu compromisso',
      subtitle: 'Assessoria personalizada em planos de saúde Hominis com mais de 10 anos de experiência. Ajudo você a escolher entre Vita Más e Aqua Más, dois planos com a mesma qualidade médica e diferentes formas de pagamento.',
      cta: 'Solicitar Assessoria',
      stats: { clients: 'Clientes Assessorados', experience: 'Anos de Experiência', satisfaction: 'Satisfação' },
    },
    about: { title: 'Sobre Mim', description: 'Sou Agustina C. Candia, assessora comercial da Hominis com mais de 10 anos de experiência no setor de saúde.', features: ['Atendimento personalizado', 'Resposta imediata', 'Assessoria gratuita'] },
    plans: { title: 'Planos de Saúde', subtitle: 'Escolha o plano que se adapta à sua forma de pagamento', vita: { name: 'Vita Más', badge: 'Premium', features: ['Sem coparticipação', 'Emergências 24/7 sem coparticipação', 'Odontologia sem custo', 'Experiência Concierge 24/7', 'Assistência ao viajante incluída', 'Farmácia incluída'], cta: 'Contratar Vita Más' }, aqua: { name: 'Aqua Más', badge: 'Economia', features: ['Coparticipação flexível', 'Emergências 24/7 sem coparticipação', 'Odontologia com co-seguro', 'Assistência ao viajante incluída', 'Farmácia 40% desconto'], cta: 'Contratar Aqua Más' } },
    promotions: { title: 'Promoções', subtitle: 'Descontos escalonados para novos associados que aderirem ao débito automático', period: 'Período', aqua: 'Aqua Más', vita: 'Vita Más', months: { '1_3': 'Meses 1 a 3', '4_6': 'Meses 4 a 6', '7_12': 'Meses 7 a 12' }, note: 'As promoções aplicam-se a novos associados de até 39 anos.' },
    services: { title: 'Serviços Digitais', virtual_doctor: { title: 'Médico Virtual', description: 'Consultas por videoconferência no app Hominis, sem sair de casa.' }, virtual_pharmacy: { title: 'Farmácia Virtual', description: 'Peça seus medicamentos com 40% de cobertura e receba em sua casa.' }, digital_management: { title: 'Gestão Digital', description: 'Acesse seu histórico médico, consultas e documentação de qualquer dispositivo.' } },
    branch: { title: 'Filial', address: 'Portela 266, Lomas de Zamora, PBA', schedule: 'Segunda a Sexta das 9:00 às 18:00', closed: 'Sábados e Domingos: Fechado', phone: '11-6555-5534', cta: 'Agendar visita por WhatsApp' },
    contact: { title: 'Contato', subtitle: 'Preencha o formulário e entrarei em contato em menos de 24 horas.', form: { name: 'Nome completo', name_placeholder: 'Ex: Maria González', email: 'Email', email_placeholder: 'ex: maria@email.com', phone: 'Telefone / WhatsApp', phone_placeholder: 'Ex: 11-5555-1234', segment: 'Situação profissional', age: 'Idade', age_placeholder: 'Ex: 32', coverage: 'Área de interesse', message: 'Mensagem', message_placeholder: 'Conte-nos qual plano lhe interessa...', submit: 'Enviar Solicitação' }, options: { segment: { payroll: 'Assalariado', monotributo: 'Monotributo', selfEmployed: 'Autônomo' }, coverage: { caba: 'CABA', gba: 'GBA' } }, success: 'Solicitação enviada com sucesso! Entrarei em contato em menos de 24 horas.' },
    footer: { copyright: '© 2025 Hominis - Assessoria de Saúde. Todos os direitos reservados.' },
  },
  theme: { light: 'Claro', dark: 'Escuro', system: 'Sistema' },
  language: { es: 'Español', en: 'English', pt: 'Português' },
  auth: { login: { title: 'Painel de Gestão', subtitle: 'Digite suas credenciais para acessar o painel', email: 'Email', password: 'Senha', submit: 'Entrar', error: 'Credenciais inválidas', back: 'Voltar ao site', note: 'Acesso exclusivo para pessoal autorizado. As credenciais são criptografadas e protegidas.' } },
  dashboard: {
    title: 'Painel de Administração', vendedor_title: 'Painel do Vendedor', productor_title: 'Painel do Produtor', welcome: 'Bem-vindo/a',
    stats: { total: 'Total Contatos', new: 'Novos', attended: 'Atendidos', rejected: 'Rejeitados', conversion: 'Conversão', activeVendors: 'Vendedores Ativos', teamContacts: 'Contatos da Equipe', teamConversion: 'Conversão da Equipe', leads: 'Total Leads', newLeads: 'Leads não atendidos' },
    actions: { newContact: 'Novo Contato', viewPipeline: 'Pipeline', viewMap: 'Mapa', viewProfile: 'Meu Perfil', viewContacts: 'Contatos', viewTeam: 'Equipe', viewMarketing: 'Marketing', viewReports: 'Relatórios', viewRanking: 'Ranking', viewInvitations: 'Convites' },
    sidebar: { dashboard: 'Painel', vendedores: 'Vendedores', contactos: 'Contatos', mapa: 'Mapa', invitaciones: 'Convites', marketing: 'Marketing', reportes: 'Relatórios', ranking: 'Ranking', pipeline: 'Pipeline', perfil: 'Perfil' },
  },
  admin: {
    vendedores: { title: 'Vendedores', activeUsers: '{count} usuários ativos', all: 'Todos', filters: { all: 'Todos', vendedor: 'Vendedores', productor: 'Produtores' }, stats: { contacts: 'contatos', conversion: 'conversão' }, empty: 'Nenhum vendedor encontrado.', create: 'Novo Vendedor' },
    contactos: { title: 'Todos os Contatos', empty: 'Nenhum contato no CRM ainda.' },
    marketing: { title: 'Painel de Marketing', totalLeads: 'Total Leads', costPerLead: 'Custo por Lead', conversionRate: 'Taxa de Conversão', roi: 'ROI', bySource: 'Fontes de Leads', dailyTrend: 'Tendência Diária' },
    reportes: { title: 'Relatórios Avançados', sales: 'Vendas', performance: 'Desempenho', export: 'Exportar Excel', from: 'De', to: 'Até' },
    leaderboard: { title: 'Leaderboard', rank: 'Posição', points: 'pontos', level: 'Nível', badges: 'Insígnias', availableBadges: 'Insígnias Disponíveis', pointsSystem: 'Como ganhar pontos' },
    invitaciones: { title: 'Convites', send: 'Convidar', newInvitation: 'Novo Convite', email: 'Email do convidado', role: 'Função', empty: 'Nenhum convite enviado ainda.' },
    mapa: { title: 'Mapa Global', subtitle: 'Todos os vendedores com raio de cobertura + todos os contatos do CRM' },
  },
  vendedor: {
    contactos: { title: 'Contatos', novo: 'Novo Contato', empty: 'Nenhum contato.', search: 'Buscar por nome, email, telefone...' },
    pipeline: { title: 'Pipeline de Vendas', dragHint: 'Arraste os cards entre as colunas para alterar o status.' },
    mapa: { title: 'Mapa da Carteira', empty: 'Nenhum contato com localização.' },
    perfil: { title: 'Meu Perfil' },
  },
  productor: {
    contactos: { title: 'Contatos da Equipe' },
    mapa: { title: 'Mapa da Equipe', subtitle: 'Vendedores com raio de cobertura + todos os contatos da equipe' },
    perfil: { title: 'Meu Perfil' },
  },
  common: {
    loading: 'Carregando...', save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', view: 'Ver',
    search: 'Buscar', all: 'Todos', close: 'Fechar', back: 'Voltar', create: 'Criar', logout: 'Sair',
    contactos: 'contatos', conv: 'conv.', score: 'Score', status: 'Status', segment: 'Segmento',
    conversions: 'conversões', recordatorios: 'Próximos Lembretes', noPending: 'Sem lembretes pendentes. Tudo em dia!',
    contactosRecientes: 'Contatos Recentes', miCartera: 'Minha Carteira', miProgreso: 'Meu Progresso',
    paraNivel: 'pts para próximo nível', ganáPuntos: 'Ganhe pontos criando contatos, agendando reuniões e fechando vendas',
  },
};

const TRANSLATIONS: Record<string, any> = { es: ES, en: EN, pt: PT };

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const inlineTranslations = TRANSLATIONS[locale] || TRANSLATIONS.es;
  const dashboardTranslations = DASHBOARD_TRANSLATIONS[locale] || DASHBOARD_TRANSLATIONS.es;

  // Merge: inline translations (landing, dashboard, vendedor) + dashboard JSON (admin, vendor, auth, help, notifications)
  const merged = { ...inlineTranslations, ...dashboardTranslations };

  return NextResponse.json(merged);
}


