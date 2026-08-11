<?php
use Illuminate\Database\Migrations\Migration; use Illuminate\Database\Schema\Blueprint; use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up():void{Schema::table('coach_analyses',function(Blueprint $table){$table->foreignId('cv_document_id')->nullable()->change();$table->string('module',32)->default('cv')->after('user_id');$table->foreignId('career_goal_id')->nullable()->after('coach_conversation_id')->constrained()->nullOnDelete();$table->string('target_role')->nullable()->after('job_title');$table->string('target_sector')->nullable()->after('target_role');$table->string('professional_domain')->nullable()->after('target_sector');$table->text('objective')->nullable()->after('professional_domain');});}
 public function down():void{Schema::table('coach_analyses',function(Blueprint $table){$table->dropConstrainedForeignId('career_goal_id');$table->dropColumn(['module','target_role','target_sector','professional_domain','objective']);$table->foreignId('cv_document_id')->nullable(false)->change();});}
};
