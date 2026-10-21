import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            E-commerce Digital
          </Link>
          <nav className="flex gap-6">
            <Link href="/produtos" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Produtos
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Acesso instantâneo aos melhores serviços
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Assine VPN, streaming, cloud storage e muito mais.
          <br />
          Acesso imediato após confirmação do pagamento.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/produtos"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Ver Produtos
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Criar Conta
          </Link>
        </div>
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Produtos em Destaque</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Placeholder cards */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="h-40 rounded-lg bg-gray-200" />
            <h3 className="mt-4 font-semibold">VPN Premium</h3>
            <p className="mt-2 text-sm text-gray-600">Acesso a servidores em +50 países</p>
            <p className="mt-4 text-2xl font-bold">R$ 29,90<span className="text-sm font-normal">/mês</span></p>
            <Link
              href="/produtos/vpn-premium"
              className="mt-4 block rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary/90"
            >
              Comprar
            </Link>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="h-40 rounded-lg bg-gray-200" />
            <h3 className="mt-4 font-semibold">Streaming HD</h3>
            <p className="mt-2 text-sm text-gray-600">Filmes e séries sem comerciais</p>
            <p className="mt-4 text-2xl font-bold">R$ 49,90<span className="text-sm font-normal">/mês</span></p>
            <Link
              href="/produtos/streaming-hd"
              className="mt-4 block rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary/90"
            >
              Comprar
            </Link>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="h-40 rounded-lg bg-gray-200" />
            <h3 className="mt-4 font-semibold">Cloud Storage 100GB</h3>
            <p className="mt-2 text-sm text-gray-600">Armazenamento seguro na nuvem</p>
            <p className="mt-4 text-2xl font-bold">R$ 34,90<span className="text-sm font-normal">/mês</span></p>
            <Link
              href="/produtos/cloud-storage-100gb"
              className="mt-4 block rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary/90"
            >
              Comprar
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2024 E-commerce Digital. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  );
}
