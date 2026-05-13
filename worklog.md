---
Task ID: 1
Agent: Main Developer
Task: Build Landing Page for Agustina C. Candia - Hominis Asesora Comercial

Work Log:
- Generated 3 AI images: profile photo (agustina_c_candia.png), logo (logo_hominis.png), hero background (hero-bg.png)
- Updated Prisma schema with Contacto model (leads table) with fields: id, nombre, email, telefono, segmento, mensaje, cobertura, edad, origen, ip, timestamps
- Ran db:push to create the database table
- Created security utilities: csrf.ts, sanitize.ts, rate-limit.ts
- Created API routes: /api/csrf (GET) and /api/leads (POST)
- Built complete landing page with 6 sections: Hero, About, Segments, Coverage, Contact Form, Footer
- Implemented WhatsApp floating button component
- Added Framer Motion animations for section reveals
- Configured corporate color scheme matching hominis.com.ar (blues, violets, gradients)
- Tested all API endpoints successfully: CSRF generation, lead creation, validation, age restriction
- Fixed Next.js config warnings (metadataBase, allowedDevOrigins)

Stage Summary:
- Full landing page for Agustina C. Candia is complete and running
- Backend API with CSRF protection, input sanitization, rate limiting, and age validation
- Database schema for leads with Prisma/SQLite
- Corporate visual identity: blue-violet gradients, Playfair Display + Inter fonts, glass effects
- All contact channels integrated: WhatsApp (11-6555-534), email, Instagram, Facebook
- Age restriction (≤64 years) enforced in both UI and API
- Three segments: Particulares, Monotributistas, Empleados en Relación de Dependencia
- Three coverage levels: Buenos Aires, Nacional, Internacional
