'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'

type Locale = 'es' | 'en' | 'pt'

/**
 * Sistema de traducción aislado para la landing de seguros.
 * No depende del I18nProvider del CRM.
 * Persiste el locale en localStorage con key 'seguros-locale'.
 * Usa useSyncExternalStore para que TODOS los componentes compartan el mismo estado
 * y se re-rendericen cuando el locale cambia (sin necesidad de Context Provider).
 */

const translations: Record<Locale, Record<string, string>> = {
  es: {
    'brand': 'Tu Asesora en Salud',
    'nav.inicio': 'Inicio',
    'nav.empresas': 'Empresas',
    'nav.comoFunciona': '¿Cómo funciona?',
    'nav.contacto': 'Contacto',
    'nav.asesorate': 'Asesorate',
    'nav.openMenu': 'Abrir menú',
    'nav.closeMenu': 'Cerrar menú',
    'theme.toggle': 'Cambiar tema',
    'lang.select': 'Idioma',

    'hero.badge': 'Asesoramiento en salud • Sin costo',
    'hero.title': 'Encontrá el plan de salud que mejor se adapta a vos',
    'hero.subtitle':
      'Con mi experiencia, encontrás la cobertura médica ideal para vos y tu familia sin vueltas ni costo.',
    'hero.cta': 'Asesorate',

    'empresas.title': 'Empresas que representamos',
    'empresas.subtitle': 'Elegí la empresa de tu interés para conocer más detalles.',
    'empresas.verMas': 'Ver más',
    'empresas.doctored.desc': 'Cobertura médica de calidad con planes flexibles.',
    'empresas.premedic.desc': 'El respaldo que te merecés con amplia red médica.',
    'empresas.doctored.slogan': 'Tu salud, nuestra prioridad',
    'empresas.premedic.slogan': 'Cuidamos lo que más valorás',
    'empresas.doctored.benefit': 'Planes desde $18.000/mes • Cobertura inmediata',
    'empresas.premedic.benefit': 'Red de +5.000 profesionales • Guardia 24hs',
    'empresas.verPlanes': 'Ver Planes',

    'comoFunciona.title': '¿Cómo funciona?',
    'comoFunciona.subtitle': 'Tres pasos simples para encontrar tu plan de salud ideal.',
    'comoFunciona.paso': 'Paso',
    'comoFunciona.step1.title': 'Elegí la empresa de tu interés',
    'comoFunciona.step1.desc':
      'Navegá las empresas que representamos y seleccioná la que más se adapte a tus necesidades.',
    'comoFunciona.step2.title': 'Completá el formulario',
    'comoFunciona.step2.desc':
      'Dejanos tus datos y contanos qué estás buscando. Tomá un minuto, sin compromiso.',
    'comoFunciona.step3.title': 'Te contactamos para asesorarte',
    'comoFunciona.step3.desc':
      'Un asesor te llamará para ayudarte a elegir el plan ideal, sin costo.',

    'contacto.title': 'Contactanos',
    'contacto.subtitle': 'Completá el formulario y un asesor te contactará a la brevedad.',
    'contacto.formTitle': 'Solicitar asesoramiento',
    'contacto.nombre': 'Nombre',
    'contacto.telefono': 'Teléfono',
    'contacto.email': 'Email',
    'contacto.empresa': 'Empresa de interés',
    'contacto.empresaPlaceholder': 'Seleccioná una empresa',
    'contacto.empresaAmbas': 'Ambas / No estoy seguro',
    'contacto.mensaje': 'Mensaje',
    'contacto.mensajePlaceholder': 'Contanos qué necesitás (opcional)',
    'contacto.enviar': 'Enviar solicitud',
    'contacto.legal':
      'Al enviar este formulario, aceptás que me comunique con vos para brindarte asesoramiento. Tus datos están protegidos.',
    'contacto.datosTitle': 'Datos de contacto',
    'contacto.qrTitle': 'Escaneá el código QR',
    'contacto.qrSubtitle': 'Accedé directamente a nuestros canales de contacto',
    'contacto.success':
      '¡Gracias! Tu solicitud fue enviada. Te contactaremos a la brevedad.',

    'footer.tagline':
      'Asesoramiento en salud. Compará las mejores opciones con asesoría personalizada y sin costo.',
    'footer.copyright': 'Todos los derechos reservados.',
  },
  en: {
    'brand': 'Your Health Advisor',
    'nav.inicio': 'Home',
    'nav.empresas': 'Companies',
    'nav.comoFunciona': 'How it works',
    'nav.contacto': 'Contact',
    'nav.asesorate': 'Get advice',
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',
    'theme.toggle': 'Toggle theme',
    'lang.select': 'Language',

    'hero.badge': 'Health advice • Free of charge',
    'hero.title': 'Find the health plan that best fits you',
    'hero.subtitle':
      'With my experience, you find the ideal medical coverage for you and your family, no strings attached and free.',
    'hero.cta': 'Get advice',

    'empresas.title': 'Companies we represent',
    'empresas.subtitle': 'Choose the company of your interest to learn more.',
    'empresas.verMas': 'See more',
    'empresas.doctored.desc': 'Quality medical coverage with flexible plans.',
    'empresas.premedic.desc': 'The backing you deserve with a wide medical network.',
    'empresas.doctored.slogan': 'Your health, our priority',
    'empresas.premedic.slogan': 'We care for what you value most',
    'empresas.doctored.benefit': 'Plans from $18,000/month • Immediate coverage',
    'empresas.premedic.benefit': 'Network of +5,000 professionals • 24h emergency',
    'empresas.verPlanes': 'View Plans',

    'comoFunciona.title': 'How it works',
    'comoFunciona.subtitle': 'Three simple steps to find your ideal health plan.',
    'comoFunciona.paso': 'Step',
    'comoFunciona.step1.title': 'Choose the company of your interest',
    'comoFunciona.step1.desc':
      'Browse the companies we represent and select the one that best fits your needs.',
    'comoFunciona.step2.title': 'Fill out the form',
    'comoFunciona.step2.desc':
      'Leave us your details and tell us what you are looking for. It takes a minute, no obligation.',
    'comoFunciona.step3.title': 'We contact you to advise you',
    'comoFunciona.step3.desc':
      'An advisor will call you to help you choose the ideal plan, free of charge.',

    'contacto.title': 'Contact us',
    'contacto.subtitle': 'Fill out the form and an advisor will contact you shortly.',
    'contacto.formTitle': 'Request advice',
    'contacto.nombre': 'Name',
    'contacto.telefono': 'Phone',
    'contacto.email': 'Email',
    'contacto.empresa': 'Company of interest',
    'contacto.empresaPlaceholder': 'Select a company',
    'contacto.empresaAmbas': 'Both / Not sure',
    'contacto.mensaje': 'Message',
    'contacto.mensajePlaceholder': 'Tell us what you need (optional)',
    'contacto.enviar': 'Send request',
    'contacto.legal':
      'By submitting this form, you agree that I may contact you to provide advice. Your data is protected.',
    'contacto.datosTitle': 'Contact details',
    'contacto.qrTitle': 'Scan the QR code',
    'contacto.qrSubtitle': 'Access our contact channels directly',
    'contacto.success':
      'Thank you! Your request has been sent. We will contact you shortly.',

    'footer.tagline':
      'Health advice. Compare the best options with personalized advice and free of charge.',
    'footer.copyright': 'All rights reserved.',
  },
  pt: {
    'brand': 'Sua Consultora de Saúde',
    'nav.inicio': 'Início',
    'nav.empresas': 'Empresas',
    'nav.comoFunciona': 'Como funciona',
    'nav.contacto': 'Contato',
    'nav.asesorate': 'Acesse agora',
    'nav.openMenu': 'Abrir menu',
    'nav.closeMenu': 'Fechar menu',
    'theme.toggle': 'Alternar tema',
    'lang.select': 'Idioma',

    'hero.badge': 'Consultoria em saúde • Grátis',
    'hero.title': 'Encontre o plano de saúde que melhor se adapta a você',
    'hero.subtitle':
      'Com minha experiência, você encontra a cobertura médica ideal para você e sua família sem complicação e grátis.',
    'hero.cta': 'Acesse agora',

    'empresas.title': 'Empresas que representamos',
    'empresas.subtitle': 'Escolha a empresa do seu interesse para saber mais.',
    'empresas.verMas': 'Ver mais',
    'empresas.doctored.desc': 'Cobertura médica de qualidade com planos flexíveis.',
    'empresas.premedic.desc': 'O respaldo que você merece com ampla rede médica.',
    'empresas.doctored.slogan': 'Sua saúde, nossa prioridade',
    'empresas.premedic.slogan': 'Cuidamos do que você mais valoriza',
    'empresas.doctored.benefit': 'Planos a partir de $18.000/mês • Cobertura imediata',
    'empresas.premedic.benefit': 'Rede de +5.000 profissionais • Plantão 24h',
    'empresas.verPlanes': 'Ver Planos',

    'comoFunciona.title': 'Como funciona',
    'comoFunciona.subtitle': 'Três passos simples para encontrar seu plano de saúde ideal.',
    'comoFunciona.paso': 'Passo',
    'comoFunciona.step1.title': 'Escolha a empresa do seu interesse',
    'comoFunciona.step1.desc':
      'Navegue pelas empresas que representamos e selecione a que melhor se adapta às suas necessidades.',
    'comoFunciona.step2.title': 'Preencha o formulário',
    'comoFunciona.step2.desc':
      'Deixe seus dados e nos diga o que você procura. Leva um minuto, sem compromisso.',
    'comoFunciona.step3.title': 'Entramos em contato para aconselhar você',
    'comoFunciona.step3.desc':
      'Um consultor ligará para você para ajudar a escolher o plano ideal, grátis.',

    'contacto.title': 'Fale conosco',
    'contacto.subtitle': 'Preencha o formulário e um consultor entrará em contato em breve.',
    'contacto.formTitle': 'Solicitar consultoria',
    'contacto.nombre': 'Nome',
    'contacto.telefono': 'Telefone',
    'contacto.email': 'E-mail',
    'contacto.empresa': 'Empresa de interesse',
    'contacto.empresaPlaceholder': 'Selecione uma empresa',
    'contacto.empresaAmbas': 'Ambas / Não tenho certeza',
    'contacto.mensaje': 'Mensagem',
    'contacto.mensajePlaceholder': 'Nos diga o que você precisa (opcional)',
    'contacto.enviar': 'Enviar solicitação',
    'contacto.legal':
      'Ao enviar este formulário, você concorda que eu entre em contato para oferecer consultoria. Seus dados estão protegidos.',
    'contacto.datosTitle': 'Dados de contato',
    'contacto.qrTitle': 'Escaneie o código QR',
    'contacto.qrSubtitle': 'Acesse diretamente nossos canais de contato',
    'contacto.success':
      'Obrigado! Sua solicitação foi enviada. Entraremos em contato em breve.',

    'footer.tagline':
      'Consultoria em saúde. Compare as melhores opções com consultoria personalizada e grátis.',
    'footer.copyright': 'Todos os direitos reservados.',
  },
}

const STORAGE_KEY = 'seguros-locale'
const VALID: Locale[] = ['es', 'en', 'pt']
const DEFAULT_LOCALE: Locale = 'es'

// Store externo compartido entre todos los componentes que usan useTranslation.
// Esto garantiza que cuando un componente cambia el locale, TODOS se re-rendericen.
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', cb)
  }
  return () => {
    listeners.delete(cb)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', cb)
    }
  }
}

function getSnapshot(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && VALID.includes(saved as Locale)) {
      return saved as Locale
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE
}

export function useTranslation() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const changeLocale = useCallback((newLocale: string) => {
    if (!VALID.includes(newLocale as Locale)) return
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // ignore
    }
    notify()
  }, [])

  const t = useCallback(
    (key: string): string => {
      const dict = translations[locale] ?? translations[DEFAULT_LOCALE]
      return dict[key] ?? translations[DEFAULT_LOCALE][key] ?? key
    },
    [locale],
  )

  return { t, locale, changeLocale }
}
