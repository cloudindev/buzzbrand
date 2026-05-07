import prisma from "@/lib/prisma"

// Normaliza texto: elimina acentos y convierte a minúsculas
export function normalizeText(text: string, ignoreAccents: boolean, caseSensitive: boolean): string {
  let res = text
  if (!caseSensitive) {
    res = res.toLowerCase()
  }
  if (ignoreAccents) {
    res = res.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }
  return res
}

export function findMatches(text: string, keyword: { term: string, matchType: string, ignoreAccents: boolean, caseSensitive: boolean }) {
  const normText = normalizeText(text, keyword.ignoreAccents, keyword.caseSensitive)
  const normTerm = normalizeText(keyword.term, keyword.ignoreAccents, keyword.caseSensitive)
  
  const matches: { index: number, matchedText: string, snippet: string }[] = []
  
  if (keyword.matchType === "exact_match") {
    // Regex for exact word boundaries
    const regex = new RegExp(`\\b${escapeRegExp(normTerm)}\\b`, keyword.caseSensitive ? "g" : "gi")
    let match;
    while ((match = regex.exec(normText)) !== null) {
      matches.push(createMatchObj(text, match.index, keyword.term.length))
    }
  } else if (keyword.matchType === "contains" || keyword.matchType === "phrase") {
    // Simple substring search
    let index = normText.indexOf(normTerm)
    while (index !== -1) {
      matches.push(createMatchObj(text, index, normTerm.length))
      index = normText.indexOf(normTerm, index + 1)
    }
  } else if (keyword.matchType === "regex") {
    try {
      const regex = new RegExp(keyword.term, keyword.caseSensitive ? "g" : "gi")
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push(createMatchObj(text, match.index, match[0].length))
      }
    } catch (e) {
      // Invalid regex
    }
  }
  
  return matches
}

function createMatchObj(originalText: string, index: number, length: number) {
  // Extract a snippet of roughly 100 characters around the match
  const start = Math.max(0, index - 50)
  const end = Math.min(originalText.length, index + length + 50)
  let snippet = originalText.substring(start, end).replace(/\n/g, " ")
  
  if (start > 0) snippet = "..." + snippet
  if (end < originalText.length) snippet = snippet + "..."
  
  return {
    index,
    matchedText: originalText.substring(index, index + length),
    snippet
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
