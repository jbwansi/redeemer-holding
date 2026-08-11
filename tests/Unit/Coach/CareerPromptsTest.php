<?php
namespace Tests\Unit\Coach;
use App\Coach\Prompts\PromptRegistry; use PHPUnit\Framework\TestCase;
class CareerPromptsTest extends TestCase { public function test_prompts_are_versioned_and_forbid_invention():void{$registry=new PromptRegistry();foreach(['career.analyze_situation','career.gap_analysis','career.explore_roles','career.build_action_plan'] as $key){$p=$registry->forKey($key);$this->assertSame($key,$p->key());$this->assertSame('1.0',$p->version());$this->assertMatchesRegularExpression('/n.invente/iu',$p->instructions());}}}
