# Ícones Gerais

Esta pasta contém ícones que podem ser usados em todo o sistema.

## Como usar:

### No código:
```jsx
// ✅ URL absoluta direta
<img src="/iconesGerais/icone.png" alt="Ícone" />

// ✅ Com process.env.PUBLIC_URL
<img src={process.env.PUBLIC_URL + '/iconesGerais/icone.png'} alt="Ícone" />

// ✅ Em CSS
background-image: url('/iconesGerais/icone.png');
```

### Estrutura recomendada:
```
public/iconesGerais/
├── interface/
│   ├── menu.svg
│   ├── close.svg
│   └── settings.svg
├── acoes/
│   ├── add.svg
│   ├── edit.svg
│   └── delete.svg
└── status/
    ├── success.svg
    ├── error.svg
    └── warning.svg
```

### Exemplo prático:
```jsx
// Componente usando ícone da pasta public
function MeuComponente() {
  return (
    <div>
      <img src="/iconesGerais/interface/menu.svg" alt="Menu" />
      <img src="/iconesGerais/acoes/add.svg" alt="Adicionar" />
    </div>
  );
}
```
