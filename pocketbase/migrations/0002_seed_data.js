migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'caiokondo82@gmail.com')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('caiokondo82@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      app.save(record)
    }

    const stores = app.findCollectionByNameOrId('stores')
    const storeNames = [
      'Tienda Central (Madrid)',
      'Sucursal Norte (Barcelona)',
      'Outlet Sur (Sevilla)',
      'Logística Este (Valencia)',
    ]

    storeNames.forEach((name, i) => {
      try {
        app.findFirstRecordByData('stores', 'name', name)
      } catch (_) {
        const record = new Record(stores)
        record.set('name', name)
        record.set('status', i === 3 ? 'Mantenimiento' : 'Operativa')
        app.save(record)
      }
    })
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'caiokondo82@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
