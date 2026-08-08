'use client'

import * as React from 'react'
import {
  makeStyles,
  tokens,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from '@fluentui/react-components'
import { brand, shellMaxWidth } from './brand'
import { SectionHeading } from './section-heading'

const useStyles = makeStyles({
  section: {
    backgroundColor: brand.surface,
    paddingTop: '72px',
    paddingBottom: '72px',
  },
  inner: {
    maxWidth: '760px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    alignItems: 'center',
  },
  list: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  item: {
    backgroundColor: brand.card,
    borderRadius: '16px',
    border: `1px solid ${brand.variant}`,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
  answer: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: '1.55',
    color: brand.inkSoft,
    paddingBottom: tokens.spacingVerticalM,
  },
})

const faqs = [
  {
    q: 'O Economize Já é realmente grátis?',
    a: 'Sim. O plano Free é gratuito para sempre e inclui transações ilimitadas, dashboard completo e o bot do Telegram com comandos simples. Você só migra para o Pro se quiser recursos avançados como a IA e lembretes.',
  },
  {
    q: 'Preciso informar dados do meu banco?',
    a: 'Não. Você registra suas transações manualmente ou pelo Telegram. A conexão automática com bancos (Open Finance) chegará no futuro como recurso Pro, sempre por meio de um agregador certificado e com a sua autorização.',
  },
  {
    q: 'Como funciona o bot do Telegram?',
    a: 'Você gera um código de vínculo dentro do app e envia para o bot no Telegram. A partir daí, é só mandar mensagens como "gasto uber 55" que o bot registra e confirma o lançamento na hora.',
  },
  {
    q: 'Meus dados financeiros estão seguros?',
    a: 'Sim. Usamos criptografia forte para senhas e dados sensíveis, conexões seguras (HTTPS) e registros de auditoria em ações críticas. Você também pode exportar ou apagar todos os seus dados quando quiser.',
  },
  {
    q: 'Funciona no computador ou só no celular?',
    a: 'O Economize Já é pensado para o celular (mobile-first), mas funciona muito bem também no notebook e no desktop — seus dados ficam sincronizados em qualquer dispositivo.',
  },
]

export function Faq() {
  const styles = useStyles()
  return (
    <section className={styles.section} id="faq">
      <div className={styles.inner}>
        <SectionHeading center eyebrow="Dúvidas frequentes" title="Tudo o que você precisa saber" />
        <Accordion collapsible multiple className={styles.list}>
          {faqs.map((item, i) => (
            <AccordionItem value={i} key={item.q} className={styles.item}>
              <AccordionHeader expandIconPosition="end">
                <span style={{ fontWeight: 600, color: brand.ink }}>{item.q}</span>
              </AccordionHeader>
              <AccordionPanel>
                <div className={styles.answer}>{item.a}</div>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
