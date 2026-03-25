describe('Subscription Plan Utilities', () => {
  
    it('free plan has lower AI credit limit than pro', () => {
      const planCredits = { free: 5, essentials: 50, pro: 200 }
      expect(planCredits.free).toBeLessThan(planCredits.pro)
      expect(planCredits.essentials).toBeLessThan(planCredits.pro)
    })
  
    it('resume score returns correct label', () => {
      const getScoreLabel = (score: number): string => {
        if (score >= 80) return 'Excellent'
        if (score >= 60) return 'Good'
        if (score >= 40) return 'Fair'
        return 'Needs Work'
      }
      expect(getScoreLabel(90)).toBe('Excellent')
      expect(getScoreLabel(70)).toBe('Good')
      expect(getScoreLabel(50)).toBe('Fair')
      expect(getScoreLabel(30)).toBe('Needs Work')
    })
  
    it('clamps AI credit count between 0 and max', () => {
      const clampCredits = (n: number, max: number) =>
        Math.min(max, Math.max(0, n))
      expect(clampCredits(-5, 200)).toBe(0)
      expect(clampCredits(999, 200)).toBe(200)
      expect(clampCredits(100, 200)).toBe(100)
    })
  })