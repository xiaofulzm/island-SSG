

import { usePageData } from "@runtime"

import { HomeHero } from "../../components/HomeHero";
import { HomeFeature } from "../../components/HomeFeature";

export function HomeLayout() {

    const { frontmatter } = usePageData();
  
  return (
    <div>
      <HomeHero hero={frontmatter.hero} ></HomeHero>
      <HomeFeature features = {frontmatter.features} ></HomeFeature>
    </div>
  )
}
