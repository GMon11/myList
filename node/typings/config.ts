interface Vtex_Auth {
  Credential: string
}

interface Vtex_Settings {
  Auth: Vtex_Auth
}

export interface AppSettings {
  Vtex_Settings: Vtex_Settings
}

