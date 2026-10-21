"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seed do banco de dados...');
    // ============================================
    // Limpar dados existentes
    // ============================================
    console.log('🧹 Limpando dados existentes...');
    await prisma.auditLog.deleteMany();
    await prisma.webhookLog.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.credential.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.order.deleteMany();
    await prisma.address.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();
    await prisma.verificationToken.deleteMany();
    // ============================================
    // Criar usuário admin
    // ============================================
    console.log('👤 Criando usuário admin...');
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@exemplo.com.br',
            nome: 'Administrador',
            cpf: '12345678901',
            telefone: '11999999999',
            senhaHash: '$2a$10$dummyHashForAdmin', // Não usar em produção
            emailVerificado: true,
        },
    });
    // ============================================
    // Criar usuário de teste
    // ============================================
    console.log('👤 Criando usuário de teste...');
    const testUser = await prisma.user.create({
        data: {
            email: 'usuario@teste.com.br',
            nome: 'João Silva',
            cpf: '98765432109',
            telefone: '21988888888',
            emailVerificado: true,
        },
    });
    // ============================================
    // Criar produtos
    // ============================================
    console.log('📦 Criando produtos...');
    const produtos = await Promise.all([
        // VPN Premium
        prisma.product.create({
            data: {
                nome: 'VPN Premium',
                slug: 'vpn-premium',
                descricaoCurta: 'Acesso ilimitado a servidores VPN em todo o mundo',
                descricao: `
          <h2>VPN Premium - Acesso Ilimitado</h2>
          <p>Proteja sua privacidade online com nossa VPN premium. Acesso a servidores em mais de 50 países.</p>
          <h3>Recursos</h3>
          <ul>
            <li>✓ Servidores em 50+ países</li>
            <li>✓ Conexões simultâneas ilimitadas</li>
            <li>✓ Protocolos: OpenVPN, WireGuard, IKEv2</li>
            <li>✓ Sem logs de atividade</li>
            <li>✓ Suporte 24/7</li>
          </ul>
        `,
                precoMensal: 29.90,
                precoTrimestral: 79.90,
                precoAnual: 249.90,
                imagemUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
                categoria: 'VPN',
                ativo: true,
                destaque: true,
                ordem: 1,
                metadata: {
                    tipo: 'vpn',
                    protocolo: 'OpenVPN',
                    paises: 50,
                },
            },
        }),
        // Streaming HD
        prisma.product.create({
            data: {
                nome: 'Streaming HD',
                slug: 'streaming-hd',
                descricaoCurta: 'Filmes e séries em qualidade HD sem comerciais',
                descricao: `
          <h2>Streaming HD - Sua Biblioteca de Entretenimento</h2>
          <p>Milhares de filmes e séries em qualidade HD, sem comerciais e com download offline.</p>
          <h3>Recursos</h3>
          <ul>
            <li>✓ +10.000 títulos</li>
            <li>✓ Qualidade HD e 4K</li>
            <li>✓ Download offline</li>
            <li>✓ Perfis múltiplos</li>
            <li>✓ Sem comerciais</li>
          </ul>
        `,
                precoMensal: 49.90,
                precoTrimestral: 129.90,
                precoAnual: 399.90,
                imagemUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800',
                categoria: 'Streaming',
                ativo: true,
                destaque: true,
                ordem: 2,
                metadata: {
                    tipo: 'streaming',
                    titulos: 10000,
                    qualidade: ['HD', '4K'],
                },
            },
        }),
        // Cloud Storage 50GB
        prisma.product.create({
            data: {
                nome: 'Cloud Storage 50GB',
                slug: 'cloud-storage-50gb',
                descricaoCurta: 'Armazenamento em nuvem seguro com 50GB',
                descricao: `
          <h2>Cloud Storage - Seus Arquivos Sempre Disponíveis</h2>
          <p>Armazene seus arquivos importantes na nuvem com segurança máxima e acesso em qualquer lugar.</p>
          <h3>Recursos</h3>
          <ul>
            <li>✓ 50GB de armazenamento</li>
            <li>✓ Sincronização automática</li>
            <li>✓ Compartilhamento seguro</li>
            <li>✓ Versões anteriores</li>
            <li>✓ Criptografia de ponta</li>
          </ul>
        `,
                precoMensal: 19.90,
                precoTrimestral: 49.90,
                precoAnual: 149.90,
                imagemUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
                categoria: 'Cloud',
                ativo: true,
                destaque: false,
                ordem: 3,
                metadata: {
                    tipo: 'cloud',
                    capacidade: 50,
                    unidade: 'GB',
                },
            },
        }),
        // Cloud Storage 100GB
        prisma.product.create({
            data: {
                nome: 'Cloud Storage 100GB',
                slug: 'cloud-storage-100gb',
                descricaoCurta: 'Armazenamento em nuvem com 100GB e backup automático',
                descricao: `
          <h2>Cloud Storage 100GB - Máximo Espaço</h2>
          <p>100GB de armazenamento para quem precisa de mais espaço e recursos avançados.</p>
          <h3>Recursos</h3>
          <ul>
            <li>✓ 100GB de armazenamento</li>
            <li>✓ Backup automático</li>
            <li>✓ Histórico de versões</li>
            <li>✓ Acesso offline</li>
            <li>✓ Suporte prioritário</li>
          </ul>
        `,
                precoMensal: 34.90,
                precoTrimestral: 89.90,
                precoAnual: 279.90,
                imagemUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
                categoria: 'Cloud',
                ativo: true,
                destaque: true,
                ordem: 4,
                metadata: {
                    tipo: 'cloud',
                    capacidade: 100,
                    unidade: 'GB',
                },
            },
        }),
        // Software de Produtividade
        prisma.product.create({
            data: {
                nome: 'Suite Produtividade',
                slug: 'suite-produtividade',
                descricaoCurta: 'Pacote completo de ferramentas de produtividade',
                descricao: `
          <h2>Suite Produtividade - Trabalhe Melhor</h2>
          <p>Conjunto completo de ferramentas para aumentar sua produtividade no dia a dia.</p>
          <h3>Inclui</h3>
          <ul>
            <li>✓ Editor de textos profissional</li>
            <li>✓ Planilhas avançadas</li>
            <li>✓ Apresentações interativas</li>
            <li>✓ 10GB cloud storage</li>
            <li>✓ Colaboração em tempo real</li>
          </ul>
        `,
                precoMensal: 39.90,
                precoTrimestral: 99.90,
                precoAnual: 299.90,
                imagemUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
                categoria: 'Software',
                ativo: true,
                destaque: false,
                ordem: 5,
                metadata: {
                    tipo: 'software',
                    apps: ['editor', 'planilhas', 'slides'],
                },
            },
        }),
    ]);
    console.log(`✅ ${produtos.length} produtos criados`);
    // ============================================
    // Criar endereço para usuário de teste
    // ============================================
    console.log('📍 Criando endereço...');
    await prisma.address.create({
        data: {
            userId: testUser.id,
            nome: 'Casa',
            cep: '01310200',
            logradouro: 'Av. Paulista',
            numero: '1000',
            complemento: 'Apto 101',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            padrao: true,
        },
    });
    // ============================================
    // Criar assinatura de teste
    // ============================================
    console.log('📋 Criando assinatura de teste...');
    const assinatura = await prisma.subscription.create({
        data: {
            userId: testUser.id,
            productId: produtos[0].id, // VPN Premium
            status: 'ACTIVE',
            plano: 'MONTHLY',
            dataInicio: new Date(),
            dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
            dataProximaRenovacao: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 dias
        },
    });
    // ============================================
    // Criar pedido de teste
    // ============================================
    console.log('🛒 Criando pedido de teste...');
    await prisma.order.create({
        data: {
            userId: testUser.id,
            productId: produtos[0].id,
            subscriptionId: assinatura.id,
            status: 'PAID',
            tipoPagamento: 'PIX',
            valor: produtos[0].precoMensal,
            paidAt: new Date(),
        },
    });
    // ============================================
    // Criar credencial de teste
    // ============================================
    console.log('🔑 Criando credencial de teste...');
    await prisma.credential.create({
        data: {
            userId: testUser.id,
            productId: produtos[0].id,
            subscriptionId: assinatura.id,
            tipo: 'vpn_credentials',
            valores: [
                { nome: 'Servidor', valor: 'br1.vpn.example.com', isPassword: false },
                { nome: 'Porta', valor: '1194', isPassword: false },
                { nome: 'Protocolo', valor: 'UDP', isPassword: false },
                { nome: 'Usuário', valor: 'joao_teste', isPassword: false },
                { nome: 'Senha', valor: 'senha123criptografada', iv: 'dummy_iv', isPassword: true },
            ],
            validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            detalhes: {
                protocolo: 'OpenVPN',
                pais: 'Brasil',
                cidade: 'São Paulo',
            },
        },
    });
    // ============================================
    // Resumo
    // ============================================
    console.log('');
    console.log('========================================');
    console.log('✅ Seed concluído com sucesso!');
    console.log('========================================');
    console.log('');
    console.log('Usuários criados:');
    console.log(`  - Admin: admin@exemplo.com.br`);
    console.log(`  - Teste: usuario@teste.com.br`);
    console.log('');
    console.log('Produtos criados:');
    produtos.forEach((p) => {
        console.log(`  - ${p.nome} (R$ ${p.precoMensal}/mês)`);
    });
    console.log('');
    console.log('Assinatura de teste:');
    console.log(`  - Usuário: usuario@teste.com.br`);
    console.log(`  - Produto: VPN Premium`);
    console.log(`  - Status: Ativa`);
    console.log('');
}
main()
    .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map