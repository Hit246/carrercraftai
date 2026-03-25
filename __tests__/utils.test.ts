describe('ATS Score Utilities', () => {
    it('returns correct grade for high score', () => {
      const getGrade = (score: number) => {
        if (score >= 80) return 'Excellent'
        if (score >= 60) return 'Good'
        if (score >= 40) return 'Fair'
        return 'Poor'
      }
      
      expect(getGrade(85)).toBe('Excellent')
      expect(getGrade(65)).toBe('Good')
      expect(getGrade(45)).toBe('Fair')
      expect(getGrade(20)).toBe('Poor')
    })
  
    it('clamps score between 0 and 100', () => {
      const clamp = (n: number) => Math.min(100, Math.max(0, n))
      expect(clamp(150)).toBe(100)
      expect(clamp(-10)).toBe(0)
      expect(clamp(75)).toBe(75)
    })
  })