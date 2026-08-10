<?php

namespace Tests\Unit;

use App\Services\PaymentAmountService;
use PHPUnit\Framework\TestCase;

class PaymentAmountServiceTest extends TestCase
{
    public function test_it_calculates_the_existing_five_percent_service_fee(): void
    {
        $amounts = (new PaymentAmountService())->calculate(200);

        $this->assertSame(200, $amounts['subtotal']);
        $this->assertSame(10.0, $amounts['serviceFee']);
        $this->assertSame(210.0, $amounts['total']);
    }

    public function test_it_preserves_decimal_string_subtotals_from_eloquent(): void
    {
        $amounts = (new PaymentAmountService())->calculate('99.90');

        $this->assertSame('99.90', $amounts['subtotal']);
        $this->assertEqualsWithDelta(4.995, $amounts['serviceFee'], 0.000001);
        $this->assertEqualsWithDelta(104.895, $amounts['total'], 0.000001);
    }
}
