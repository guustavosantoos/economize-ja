'use client'

import * as React from 'react'
import { makeStyles, tokens } from '@fluentui/react-components'
import {
  ArrowDownRight16Regular,
  ArrowUpRight16Regular,
  Wallet16Regular,
  Cart16Regular,
  Food16Regular,
  VehicleCar16Regular,
} from '@fluentui/react-icons'
import { brand, cardShadowLg } from './brand'

const useStyles = makeStyles({
  phone: {
    position: 'relative',
    width: '300px',
    maxWidth: '100%',
    borderRadius: '40px',
    backgroundColor: '#04211F',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '12px',
    paddingRight: '12px',
    boxShadow: cardShadowLg,
  },
  notch: {
    position: 'absolute',
    top: '18px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '110px',
    height: '22px',
    borderRadius: '999px',
    backgroundColor: '#04211F',
    zIndex: 2,
  },
  screen: {
    borderRadius: '30px',
    backgroundColor: brand.surface,
    overflow: 'hidden',
    height: '600px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundImage: `linear-gradient(150deg, ${brand.teal}, ${brand.tealContainer})`,
    paddingTop: '40px',
    paddingBottom: '24px',
    paddingLeft: '20px',
    paddingRight: '20px',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  greeting: {
    fontSize: tokens.fontSizeBase200,
    color: brand.onDark,
  },
  balanceLabel: {
    fontSize: tokens.fontSizeBase200,
    color: brand.mintDim,
    marginTop: '10px',
  },
  balance: {
    fontSize: '30px',
    fontWeight: tokens.fontWeightBold,
    letterSpacing: '-0.02em',
    lineHeight: '1.1',
  },
  pillRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '14px',
  },
  pill: {
    flex: 1,
    borderRadius: '14px',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '12px',
    paddingRight: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  pillLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: brand.onDark,
  },
  pillValue: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },
  income: { color: brand.greenContainer },
  expense: { color: '#FFB4AB' },
  body: {
    flex: 1,
    paddingTop: '18px',
    paddingBottom: '18px',
    paddingLeft: '20px',
    paddingRight: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: brand.card,
    borderRadius: '18px',
    paddingTop: '14px',
    paddingBottom: '14px',
    paddingLeft: '16px',
    paddingRight: '16px',
    boxShadow: '0 4px 12px rgba(13, 77, 77, 0.05)',
  },
  cardTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: brand.inkSoft,
    marginBottom: '12px',
  },
  donutRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  donut: {
    width: '86px',
    height: '86px',
    borderRadius: '999px',
    flexShrink: 0,
    backgroundImage: `conic-gradient(${brand.teal} 0deg 140deg, ${brand.green} 140deg 232deg, ${brand.mintDim} 232deg 300deg, ${brand.variant} 300deg 360deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHole: {
    width: '52px',
    height: '52px',
    borderRadius: '999px',
    backgroundColor: brand.card,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: tokens.fontWeightSemibold,
    color: brand.ink,
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    flex: 1,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: brand.inkSoft,
  },
  dot: {
    width: '9px',
    height: '9px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  legendValue: {
    marginLeft: 'auto',
    fontWeight: tokens.fontWeightSemibold,
    color: brand.ink,
  },
  txList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tx: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  txIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txIconExpense: {
    backgroundColor: brand.errorContainer,
    color: brand.error,
  },
  txIconIncome: {
    backgroundColor: brand.greenSoft,
    color: brand.green,
  },
  txMeta: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.25',
  },
  txName: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: brand.ink,
  },
  txCat: {
    fontSize: '11px',
    color: brand.outline,
  },
  txAmount: {
    marginLeft: 'auto',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  amountExpense: { color: brand.error },
  amountIncome: { color: brand.green },
})

const legend = [
  { label: 'Moradia', value: '39%', color: brand.teal },
  { label: 'Alimentação', value: '26%', color: brand.green },
  { label: 'Transporte', value: '19%', color: brand.mintDim },
  { label: 'Outros', value: '16%', color: brand.variant },
]

const transactions = [
  {
    name: 'Supermercado Pão de Açúcar',
    cat: 'Alimentação',
    amount: '- R$ 214,90',
    kind: 'expense' as const,
    Icon: Cart16Regular,
  },
  {
    name: 'Salário',
    cat: 'Renda • hoje',
    amount: '+ R$ 4.800,00',
    kind: 'income' as const,
    Icon: Wallet16Regular,
  },
  {
    name: 'Uber',
    cat: 'Transporte',
    amount: '- R$ 32,50',
    kind: 'expense' as const,
    Icon: VehicleCar16Regular,
  },
  {
    name: 'iFood',
    cat: 'Alimentação',
    amount: '- R$ 58,70',
    kind: 'expense' as const,
    Icon: Food16Regular,
  },
]

export function AppMockup() {
  const styles = useStyles()
  return (
    <div className={styles.phone} role="img" aria-label="Prévia do painel do aplicativo Economize Já mostrando saldo do mês, gastos por categoria e últimas transações">
      <div className={styles.notch} />
      <div className={styles.screen}>
        <div className={styles.header}>
          <span className={styles.greeting}>Olá, Marina</span>
          <span className={styles.balanceLabel}>Saldo do mês</span>
          <span className={styles.balance}>R$ 3.240,80</span>
          <div className={styles.pillRow}>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>
                <ArrowUpRight16Regular /> Receitas
              </span>
              <span className={`${styles.pillValue} ${styles.income}`}>R$ 4.800</span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>
                <ArrowDownRight16Regular /> Despesas
              </span>
              <span className={`${styles.pillValue} ${styles.expense}`}>R$ 1.559</span>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Gastos por categoria</div>
            <div className={styles.donutRow}>
              <div className={styles.donut} aria-hidden="true">
                <div className={styles.donutHole}>R$ 1.559</div>
              </div>
              <div className={styles.legend}>
                {legend.map((item) => (
                  <div key={item.label} className={styles.legendItem}>
                    <span
                      className={styles.dot}
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                    <span className={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Últimas transações</div>
            <div className={styles.txList}>
              {transactions.map((tx) => (
                <div key={tx.name} className={styles.tx}>
                  <span
                    className={`${styles.txIcon} ${
                      tx.kind === 'expense'
                        ? styles.txIconExpense
                        : styles.txIconIncome
                    }`}
                  >
                    <tx.Icon />
                  </span>
                  <span className={styles.txMeta}>
                    <span className={styles.txName}>{tx.name}</span>
                    <span className={styles.txCat}>{tx.cat}</span>
                  </span>
                  <span
                    className={`${styles.txAmount} ${
                      tx.kind === 'expense'
                        ? styles.amountExpense
                        : styles.amountIncome
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
