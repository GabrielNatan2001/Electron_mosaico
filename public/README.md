# Pasta Public

Esta pasta contém arquivos estáticos que serão servidos diretamente.

## Como usar:

### Imagens:
- Coloque suas imagens aqui (ex: `logo.png`, `banner.jpg`)
- Use no código como: `<img src="/logo.png" />`
- Ou: `<img src={process.env.PUBLIC_URL + '/logo.png'} />`

### Outros arquivos:
- PDFs, documentos, etc.
- Acessíveis via URL absoluta: `/documento.pdf`

## Exemplo:
```jsx
// ✅ Correto - URL absoluta
<img src="/logo.png" alt="Logo" />

// ✅ Também funciona
<img src={process.env.PUBLIC_URL + '/banner.jpg'} alt="Banner" />

// ❌ Errado - não funciona
<img src="public/logo.png" alt="Logo" />
```
