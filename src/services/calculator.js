// Motor de Cálculo de Consumo para Alimentos e Bebidas — LAÇO

export const DEFAULT_CONSUMPTION_FACTORS = {
  // Salgados (unidades por pessoa)
  salgados: {
    name: 'Salgados finos e fritos',
    category: 'alimentos',
    defaultPerAdult: 12,
    defaultPerChild: 6,
    unit: 'un',
    packSize: 50, // caixa com 50
    description: '12 un/adulto e 6 un/criança para festas de 4h com prato principal ou 15 a 18 un se for apenas coquetel.',
  },
  // Doces (unidades por pessoa)
  doces: {
    name: 'Docinhos tradicionais e finos',
    category: 'alimentos',
    defaultPerAdult: 5,
    defaultPerChild: 4,
    unit: 'un',
    packSize: 50,
    description: '5 a 6 unidades por adulto e 4 por criança.',
  },
  // Bolo (gramas por pessoa)
  bolo: {
    name: 'Bolo de corte / comemorativo',
    category: 'alimentos',
    defaultPerAdult: 100, // 100g
    defaultPerChild: 80, // 80g
    unit: 'kg',
    factorToKg: 0.001,
    packSize: 1, // kg
    description: '100g por pessoa quando há outros doces servidos.',
  },
  // Refrigerante (ml por pessoa)
  refrigerante: {
    name: 'Refrigerante (comum e zero)',
    category: 'bebidas',
    defaultPerAdult: 600, // 600ml
    defaultPerChild: 500, // 500ml
    unit: 'garrafas 2L',
    factorToPack: 2000, // 2000ml por garrafa
    description: '600ml por pessoa (equivalente a aprox. 1 garrafa de 2L a cada 3 a 4 pessoas).',
  },
  // Suco (ml por pessoa)
  suco: {
    name: 'Sucos naturais / integrais',
    category: 'bebidas',
    defaultPerAdult: 300,
    defaultPerChild: 400,
    unit: 'litros',
    factorToPack: 1000,
    description: '300ml a 400ml por pessoa como alternativa refrescante.',
  },
  // Água mineral (ml por pessoa)
  agua: {
    name: 'Água mineral (com e sem gás)',
    category: 'bebidas',
    defaultPerAdult: 400,
    defaultPerChild: 300,
    unit: 'garrafas 500ml',
    factorToPack: 500,
    description: '400ml por pessoa. Essencial em qualquer clima.',
  },
  // Cerveja / Chopp (ml por pessoa que bebe)
  cerveja: {
    name: 'Cerveja / Chopp artesanal',
    category: 'bebidas',
    defaultPerAdult: 1500, // 1.5L
    defaultPerChild: 0,
    unit: 'latas 350ml',
    factorToPack: 350,
    description: 'Cálculo para 4 a 5 latas por adulto consumidor de bebidas alcoólicas.',
  },
  // Espumante ou Vinho (garrafa por pessoas)
  espumante: {
    name: 'Espumante para brinde',
    category: 'bebidas',
    defaultPerAdult: 250, // 250ml
    defaultPerChild: 0,
    unit: 'garrafas 750ml',
    factorToPack: 750,
    description: '1 garrafa serve de 3 a 4 pessoas para brinde.',
  },
  // Descartáveis (copos, guardanapos, pratos)
  copos: {
    name: 'Copos descartáveis ou acrílicos',
    category: 'descartaveis',
    defaultPerAdult: 4,
    defaultPerChild: 4,
    unit: 'un',
    consumptionUnit: 'un',
    packSize: 50,
    description: '4 copos por pessoa (pessoas costumam trocar de copo durante a festa).',
  },
  pratinhos: {
    name: 'Pratinhos para bolo/doces',
    category: 'descartaveis',
    defaultPerAdult: 2,
    defaultPerChild: 2,
    unit: 'un',
    consumptionUnit: 'un',
    packSize: 50,
    description: '2 pratinhos por pessoa.',
  },
  guardanapos: {
    name: 'Guardanapos de papel',
    category: 'descartaveis',
    defaultPerAdult: 10,
    defaultPerChild: 10,
    unit: 'pacotes 50un',
    consumptionUnit: 'un',
    factorToPack: 50,
    description: 'Média de 8 a 10 guardanapos por convidado.',
  }
};

/**
 * Realiza os cálculos de quantidade total e arredondamentos recomendados para compras
 */
export function calculateEventSupplies(adultsCount, childrenCount, customFactors = {}, hasAlcohol = true) {
  const safeAdults = Math.max(0, Number(adultsCount) || 0);
  const safeChildren = Math.max(0, Number(childrenCount) || 0);
  const totalGuests = safeAdults + safeChildren;

  const results = {};

  Object.entries(DEFAULT_CONSUMPTION_FACTORS).forEach(([key, config]) => {
    // Se não houver álcool e o item for cerveja ou espumante, pula
    if (!hasAlcohol && (key === 'cerveja' || key === 'espumante')) {
      return;
    }

    const perAdult = customFactors[key]?.perAdult ?? config.defaultPerAdult;
    const perChild = customFactors[key]?.perChild ?? config.defaultPerChild;
    const cUnit = config.consumptionUnit || (key === 'bolo' ? 'g' : ['refrigerante','suco','agua','cerveja','espumante'].includes(key) ? 'ml' : 'un');

    const rawTotal = (safeAdults * perAdult) + (safeChildren * perChild);

    let displayQuantity = rawTotal;
    let purchaseQuantity = rawTotal;
    let purchaseUnit = config.unit;
    let formula = `${safeAdults} adultos × ${perAdult}${cUnit} + ${safeChildren} crianças × ${perChild}${cUnit}`;

    if (key === 'bolo') {
      // Gramas -> kg
      displayQuantity = (rawTotal / 1000).toFixed(1);
      purchaseQuantity = Math.ceil(rawTotal / 1000);
      purchaseUnit = 'kg';
      formula = `(${safeAdults} × ${perAdult}g + ${safeChildren} × ${perChild}g) = ${(rawTotal/1000).toFixed(1)} kg (sugestão: ${purchaseQuantity} kg)`;
    } else if (config.factorToPack) {
      const units = rawTotal / config.factorToPack;
      displayQuantity = units.toFixed(1);
      purchaseQuantity = Math.ceil(units);
      formula = `${rawTotal} ${cUnit} / ${config.factorToPack} ${cUnit} por unidade = ${displayQuantity} ${config.unit} (sugestão: ${purchaseQuantity} ${config.unit})`;
    } else if (config.packSize) {
      purchaseQuantity = Math.ceil(rawTotal / config.packSize) * config.packSize;
      displayQuantity = rawTotal;
      formula = `${rawTotal} ${cUnit} (sugestão: ${purchaseQuantity} un em pacotes de ${config.packSize})`;
    }

    results[key] = {
      key,
      name: config.name,
      category: config.category,
      perAdult,
      perChild,
      consumptionUnit: cUnit,
      rawTotal,
      displayQuantity,
      purchaseQuantity,
      unit: purchaseUnit,
      formula,
      description: config.description,
    };
  });

  return {
    totalGuests,
    adults: safeAdults,
    children: safeChildren,
    items: results,
  };
}
