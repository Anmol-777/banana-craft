import HeroSection from '../components/Hero/HeroSection'
import CollectionSection from '../components/Collection/CollectionSection'
import StorySection from '../components/Story/StorySection'
import AwardsSection from '../components/Awards/AwardsSection'
import InnovationsSection from '../components/Innovations/InnovationsSection'
import StatisticsSection from '../components/Stats/StatisticsSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <CollectionSection />
      <StorySection />
      <AwardsSection />
      <InnovationsSection />
      <StatisticsSection />
    </>
  )
}
