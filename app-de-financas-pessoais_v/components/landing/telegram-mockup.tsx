'use client'

import * as React from 'react'
import { makeStyles, tokens } from '@fluentui/react-components'
import { Bot16Regular, Checkmark12Regular } from '@fluentui/react-icons'
import { brand, cardShadowLg } from './brand'

const useStyles = makeStyles({
  window: {
    width: '340px',
    maxWidth: '100%',
    borderRadius: '24px',
    backgroundColor: brand.card,
    boxShadow: cardShadowLg,
    overflow: 'hidden',
    border: `1px solid ${brand.variant}`,
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundImage: `linear-gradient(150deg, ${brand.teal}, ${brand.tealContainer})`,
    paddingTop: '14px',
    paddingBottom: '14px',
    paddingLeft: '16px',
    paddingRight: '16px',
    color: '#FFFFFF',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '999px',
    backgroundColor: brand.mint,
    color: brand.teal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  botName: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: '1.2',
  },
  botStatus: {
    fontSize: '11px',
    color: brand.mintDim,
  },
  chat: {
    backgroundColor: brand.mintSoft,
    paddingTop: '18px',
    paddingBottom: '18px',
    paddingLeft: '16px',
    paddingRight: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minHeight: '300px',
  },
  bubble: {
    maxWidth: '80%',
    paddingTop: '9px',
    paddingBottom: '9px',
    paddingLeft: '13px',
    paddingRight: '13px',
    fontSize: tokens.fontSizeBase200,
    lineHeight: '1.4',
    boxShadow: '0 1px 2px rgba(0,53,53,0.08)',
  },
  fromUser: {
    alignSelf: 'flex-end',
    backgroundColor: brand.greenContainer,
    color: '#00391F',
    borderRadius: '14px 14px 4px 14px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
  },
  fromBot: {
    alignSelf: 'flex-start',
    backgroundColor: brand.card,
    color: brand.ink,
    borderRadius: '14px 14px 14px 4px',
  },
  botStrong: {
    fontWeight: tokens.fontWeightSemibold,
    color: brand.teal,
  },
  amount: {
    fontWeight: tokens.fontWeightBold,
  },
  time: {
    fontSize: '10px',
    color: '#3F6B57',
    whiteSpace: 'nowrap',
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px',
    color: brand.green,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '12px',
  },
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: brand.card,
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '14px',
    paddingRight: '14px',
    borderTop: `1px solid ${brand.variant}`,
    color: brand.outline,
    fontSize: tokens.fontSizeBase200,
  },
  inputField: {
    flex: 1,
    backgroundColor: brand.low,
    borderRadius: '999px',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '14px',
    paddingRight: '14px',
  },
  sendBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '999px',
    backgroundColor: brand.teal,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '16px',
  },
})

export function TelegramMockup() {
  const styles = useStyles()
  return (
    <div
      className={styles.window}
      role="img"
      aria-label="Conversa no Telegram: o usuário envia 'gasto uber 55' e o bot confirma o registro da despesa"
    >
      <div className={styles.bar}>
        <span className={styles.avatar} aria-hidden="true">
          <Bot16Regular />
        </span>
        <span>
          <div className={styles.botName}>Economize Já Bot</div>
          <div className={styles.botStatus}>online</div>
        </span>
      </div>

      <div className={styles.chat}>
        <div className={`${styles.bubble} ${styles.fromBot}`}>
          Conta vinculada com sucesso! Agora é só me contar seus gastos.
        </div>
        <div className={`${styles.bubble} ${styles.fromUser}`}>
          gasto uber 55
          <span className={styles.time}>14:32</span>
        </div>
        <div className={`${styles.bubble} ${styles.fromBot}`}>
          <span className={styles.botStrong}>Despesa registrada</span> 🚗
          <br />
          Transporte • <span className={styles.amount}>R$ 55,00</span>
          <div className={styles.confirmRow}>
            <Checkmark12Regular /> Adicionado ao seu mês
          </div>
        </div>
        <div className={`${styles.bubble} ${styles.fromUser}`}>
          renda salario 4800
          <span className={styles.time}>14:33</span>
        </div>
        <div className={`${styles.bubble} ${styles.fromBot}`}>
          <span className={styles.botStrong}>Receita registrada</span> 💰
          <br />
          Salário • <span className={styles.amount}>R$ 4.800,00</span>
        </div>
      </div>

      <div className={styles.inputBar}>
        <span className={styles.inputField}>Mensagem</span>
        <span className={styles.sendBtn} aria-hidden="true">
          ➤
        </span>
      </div>
    </div>
  )
}
