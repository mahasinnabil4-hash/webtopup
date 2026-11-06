import { SupplierAdapter } from './types'
import { DigiflazzAdapter } from './digiflazz'
import { ManualSupplierAdapter } from './manual'

const adapters = new Map<string, SupplierAdapter>()

export function getSupplierAdapter(code: string): SupplierAdapter | null {
  if (adapters.has(code)) {
    return adapters.get(code)!
  }

  let adapter: SupplierAdapter | null = null

  switch (code.toUpperCase()) {
    case 'DIGIFLAZZ':
      adapter = new DigiflazzAdapter()
      break
    case 'MANUAL':
      adapter = new ManualSupplierAdapter()
      break
    default:
      return null
  }

  adapters.set(code, adapter)
  return adapter
}

export function initializeSupplierAdapter(code: string, config: any): SupplierAdapter | null {
  const adapter = getSupplierAdapter(code)
  if (adapter) {
    adapter.initialize(config)
  }
  return adapter
}

export function getAvailableAdapters(): string[] {
  return ['DIGIFLAZZ', 'MANUAL']
}