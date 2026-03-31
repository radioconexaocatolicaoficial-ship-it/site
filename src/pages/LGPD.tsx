import Layout from "@/components/Layout";

const LGPD = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 text-primary">Política de Privacidade e LGPD</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: janeiro de 2025</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">1. Quem somos</h2>
          <p>A <strong>Rádio Conexão Católica</strong> é uma web rádio católica fundada em 5 de dezembro de 2013, na Diocese de São Miguel Paulista, São Paulo. Nosso e-mail de contato é <a href="mailto:contato@radioconexaocatolica.com.br" className="text-primary underline">contato@radioconexaocatolica.com.br</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">2. Dados que coletamos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Endereço de e-mail (quando você se inscreve em nossa newsletter)</li>
            <li>Dados de navegação (páginas visitadas, tempo de acesso, dispositivo)</li>
            <li>Dados fornecidos voluntariamente pelo formulário de contato</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">3. Como usamos seus dados</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Envio de newsletter e comunicados da rádio</li>
            <li>Resposta a mensagens enviadas pelo formulário de contato</li>
            <li>Melhoria da experiência de navegação no site</li>
            <li>Análise de audiência e desempenho do site</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">4. Base legal (LGPD)</h2>
          <p>O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses previstas na Lei nº 13.709/2018 (LGPD):</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Consentimento</strong> — para envio de newsletter e uso de cookies não essenciais</li>
            <li><strong>Legítimo interesse</strong> — para análise de navegação e segurança do site</li>
            <li><strong>Execução de contrato</strong> — para responder solicitações de contato</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">5. Cookies</h2>
          <p>Utilizamos cookies para melhorar sua experiência de navegação. Você pode aceitar ou recusar o uso de cookies não essenciais ao acessar o site. Os cookies essenciais são necessários para o funcionamento básico do site e não podem ser desativados.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">6. Compartilhamento de dados</h2>
          <p>Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins comerciais. Podemos compartilhar dados com prestadores de serviço essenciais (como plataformas de e-mail marketing), sempre sob obrigação de confidencialidade.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">7. Seus direitos</h2>
          <p>Conforme a LGPD, você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Confirmar a existência de tratamento dos seus dados</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação dos dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
          <p className="mt-2">Para exercer seus direitos, entre em contato pelo e-mail <a href="mailto:contato@radioconexaocatolica.com.br" className="text-primary underline">contato@radioconexaocatolica.com.br</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">8. Retenção de dados</h2>
          <p>Seus dados são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta política ou conforme exigido por lei. Após esse período, os dados são excluídos de forma segura.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">9. Segurança</h2>
          <p>Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, perda ou destruição.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">10. Alterações nesta política</h2>
          <p>Esta política pode ser atualizada periodicamente. Recomendamos que você a revise regularmente. Alterações significativas serão comunicadas pelo site.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary">11. Contato</h2>
          <p>Dúvidas sobre esta política ou sobre o tratamento dos seus dados? Entre em contato:</p>
          <ul className="list-none pl-0 mt-2 space-y-1">
            <li>📧 <a href="mailto:contato@radioconexaocatolica.com.br" className="text-primary underline">contato@radioconexaocatolica.com.br</a></li>
            <li>📍 São Paulo, SP</li>
          </ul>
        </section>

      </div>
    </div>
  </Layout>
);

export default LGPD;
