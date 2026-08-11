<?php
namespace Tests\Unit\Coach;
use App\Coach\Prompts\PromptRegistry; use PHPUnit\Framework\TestCase;
class CertificationPromptsTest extends TestCase { public function test_prompts_are_versioned_and_separate_facts_from_unverified_recommendations():void{$registry=new PromptRegistry();foreach(['certification.skills_gap','certification.recommend','certification.learning_plan'] as $key){$p=$registry->forKey($key);$this->assertSame($key,$p->key());$this->assertSame('1.0',$p->version());$this->assertMatchesRegularExpression('/n.invente|jamais|suggestion/iu',$p->instructions());}}}
