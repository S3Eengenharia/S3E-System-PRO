# S3E System PRO - Sistema de Gestão Empresarial

## 📋 Sobre o Projeto

O **S3E System PRO** é um sistema completo de gestão empresarial desenvolvido especificamente para empresas de engenharia elétrica. O sistema oferece uma solução integrada para gerenciamento de projetos, orçamentos, estoque, clientes e todas as operações relacionadas ao negócio.

## 🚀 Funcionalidades Principais

### 📊 Dashboard
- Visão geral dos indicadores principais
- Estatísticas em tempo real
- Alertas críticos de estoque
- Projetos em andamento
- Movimentações recentes

### 💰 Orçamentos
- Criação e gestão de orçamentos
- Cálculo automático de valores
- Anexo de imagens e documentos
- Controle de status (Pendente, Aprovado, Recusado)
- Histórico completo de orçamentos

### 📦 Catálogo
- Gestão de produtos e kits
- Configuração de kits personalizados
- Controle de preços e especificações
- Categorização por tipo de material

### 🔧 Serviços
- Cadastro de serviços oferecidos
- Controle de preços por tipo
- Códigos internos para identificação
- Categorização por tipo (Consultoria, Instalação, Manutenção, etc.)

### 📈 Movimentações
- Controle de entrada e saída de materiais
- Rastreamento de movimentações
- Histórico detalhado
- Controle de responsáveis

### 📚 Histórico
- Log completo de todas as ações
- Rastreamento por módulo
- Histórico de usuários
- Auditoria de mudanças

### 🛒 Compras
- Gestão de pedidos de compra
- Controle de fornecedores
- Acompanhamento de status
- Gestão de parcelamentos

### 📦 Materiais
- Controle completo de estoque
- Alertas de estoque mínimo
- Categorização por tipo
- Controle de localização
- Gestão de fornecedores

### 📁 Projetos
- Gestão completa de projetos
- Controle de etapas e status
- Lista de materiais (BOM)
- Controle de qualidade
- Anexos e documentos

### 🏗️ Obras
- Gestão de obras em campo
- Controle de equipes
- Acompanhamento de progresso
- Integração com projetos

### 👥 Clientes
- CRM completo
- Histórico de projetos
- Oportunidades de vendas
- Interações e atendimento
- Controle de status

### 🚚 Fornecedores
- Cadastro completo de fornecedores
- Categorização por tipo
- Controle de contatos
- Histórico de compras

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19.1.1
- **Linguagem**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Heroicons (SVG)

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🚀 Instalação e Execução

### 1. Clone o repositório
```bash
git clone <url-do-repositório>
cd S3E-System-PRO
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Execute o projeto em modo de desenvolvimento
```bash
npm run dev
```

### 4. Acesse o sistema
Abra seu navegador e acesse: `http://localhost:5173`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção

## 🏗️ Estrutura do Projeto

```
S3E-System-PRO/
├── components/           # Componentes React
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── Orcamentos.tsx   # Gestão de orçamentos
│   ├── Catalogo.tsx     # Catálogo de produtos
│   ├── Materiais.tsx    # Gestão de materiais
│   ├── Projetos.tsx     # Gestão de projetos
│   ├── Clientes.tsx     # CRM de clientes
│   └── ...              # Outros componentes
├── data/                # Dados mockados
│   └── mockData.ts      # Dados de exemplo
├── types.ts             # Definições de tipos TypeScript
├── constants.tsx        # Constantes e ícones
├── App.tsx              # Componente principal
└── index.tsx            # Ponto de entrada
```

## 📊 Tipos de Dados Principais

### Projetos
- **Tipos**: Projeto Técnico, Laudo Técnico, SPDA, Montagem de Quadro, Projeto Completo com Obra
- **Status**: Planejamento, Em Execução, Controle de Qualidade, Concluído, Cancelado
- **Controle**: Etapas, materiais, qualidade, anexos

### Orçamentos
- **Status**: Pendente, Aprovado, Recusado
- **Componentes**: Materiais, serviços, imagens, cálculos automáticos

### Materiais
- **Categorias**: Material Elétrico, Insumo, Ferramenta
- **Controle**: Estoque, preços, fornecedores, localização

### Clientes
- **Tipos**: Pessoa Física, Pessoa Jurídica
- **Status**: Ativo, Inativo, Potencial, Retroativo
- **CRM**: Oportunidades, histórico, interações

## 🎯 Funcionalidades em Destaque

### Sistema de Alertas
- Alertas críticos de estoque baixo
- Notificações de projetos em atraso
- Avisos de materiais em falta

### Controle de Qualidade
- Checklist de qualidade para projetos
- Aprovação de etapas
- Controle de conformidade

### Gestão de Equipes
- Atribuição de responsáveis
- Controle de equipes de obra
- Acompanhamento de progresso

### Relatórios e Analytics
- Dashboard com métricas em tempo real
- Estatísticas de vendas
- Controle de estoque
- Análise de projetos

## 🔧 Configuração

O sistema utiliza dados mockados para demonstração. Para implementação em produção, será necessário:

1. **Backend**: Implementar API REST ou GraphQL
2. **Banco de Dados**: Configurar banco de dados (PostgreSQL, MySQL, etc.)
3. **Autenticação**: Implementar sistema de login e autorização
4. **Upload de Arquivos**: Configurar serviço de armazenamento
5. **Notificações**: Implementar sistema de notificações

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

## 🎨 Interface

- Design moderno e intuitivo
- Tema claro com cores profissionais
- Navegação lateral responsiva
- Componentes reutilizáveis
- Feedback visual para ações

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de autenticação
- [ ] Integração com banco de dados
- [ ] Relatórios avançados
- [ ] Sistema de notificações
- [ ] API REST completa
- [ ] Testes automatizados
- [ ] Deploy automatizado

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença privativa. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato:

- **Email**: antoniojrtech@gmail.com
- **Telefone**: (47) 99636-2471
- **Website**: https://antonio-jdev.github.io/portfolio-01

## 🏢 Sobre a S3E

A S3E é uma empresa especializada em engenharia elétrica, oferecendo soluções completas em projetos, instalações e manutenções elétricas. Este sistema foi desenvolvido para otimizar e automatizar todos os processos internos da empresa.

---

**Desenvolvido com carinho pelo @Antonio-jdev**
